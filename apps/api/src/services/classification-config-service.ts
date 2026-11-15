import { type ClassificationConfig, type ConfigInput, classifyColor, rangeKeys, scaleMax } from "@color-bank-hub/contracts/color-classification";
import { season, undertone } from "@color-bank-hub/contracts/common";
import { fail } from "#api/core/errors.js";
import { db, type Executor } from "#api/lib/db.js";
import * as repository from "#api/repositories/classification-config-repository.js";
import { updateShadeLabels } from "#api/services/shade-service.js";

export async function findActive(productFormatItemId: number) {
  const row = await repository.findActiveConfig(productFormatItemId);
  if (!row) fail("NOT_FOUND", "No active classification config for this format", "CONFIG_NOT_FOUND");
  return row.config as ClassificationConfig;
}

export async function listVersions(productFormatId: number) {
  if (!(await repository.findFormat(productFormatId))) fail("NOT_FOUND", "Category not found", "FORMAT_NOT_FOUND");
  return repository.listVersions(productFormatId);
}

/** Rules the shape check cannot express. */
function checkRules(config: ClassificationConfig) {
  // Undertone and season are database enums: only their cut-offs can change, not their names.
  const fixed = [
    ["undertone", undertone.options],
    ["season", season.options],
  ] as const;
  for (const [group, allowed] of fixed) {
    const unknown = config[group].rules.find((rule) => !(allowed as readonly string[]).includes(rule.label));
    if (unknown) fail("BUSINESS_RULE", `"${unknown.label}" is not a valid ${group}. Use: ${allowed.join(", ")}`, "INVALID_LABEL");
  }
  // Every shade needs a family: the last rule must match everything (each range absent or the whole scale).
  const last = config.colorFamily.rules.at(-1);
  const open = rangeKeys.every((key) => !last?.[key] || (last[key].min <= 0 && last[key].max >= scaleMax(key, config.colorFamily.model)));
  if (!open)
    fail(
      "BUSINESS_RULE",
      "The last color family rule must cover every hue, lightness and saturation, so every shade gets a family",
      "CATCH_ALL_REQUIRED",
    );
  const families = new Set(config.colorFamily.rules.map((rule) => rule.label));
  const orphan = config.colorSub?.find((rule) => !families.has(rule.family));
  if (orphan) fail("BUSINESS_RULE", `Sub "${orphan.label}" belongs to "${orphan.family}", which is not a color family`, "UNKNOWN_FAMILY");
  // A sub is only checked on shades already in its family, so the part of a range outside the family never matches: reject it as misleading.
  // A whole-scale range narrows nothing and is always fine.
  const top = (key: (typeof rangeKeys)[number]) => scaleMax(key, config.colorFamily.model);
  const span = (range: { min: number; max: number }) => (range.max - range.min + 360) % 360;
  for (const sub of config.colorSub ?? []) {
    const parents = config.colorFamily.rules.filter((rule) => rule.label === sub.family);
    const outside = rangeKeys.find((key) => {
      const own = sub[key];
      if (!own || (own.min <= 0 && own.max >= top(key))) return false;
      return !parents.some((parent) => {
        const limit = parent[key];
        if (!limit || (limit.min <= 0 && limit.max >= top(key))) return true;
        // Hue may wrap past 0°: compare as offsets from the family's start.
        if (key === "hue") return ((own.min - limit.min + 360) % 360) + span(own) <= span(limit);
        return own.min >= limit.min && own.max <= limit.max;
      });
    });
    if (outside) fail("BUSINESS_RULE", `Sub "${sub.label}" has a ${outside} range outside its family "${sub.family}"`, "SUB_OUTSIDE_FAMILY");
  }
}

/** Stores the labels this config gives every shade of the category, in the caller's transaction. */
function reclassify(tx: Executor, productFormatId: number, config: ClassificationConfig) {
  return updateShadeLabels(tx, productFormatId, (hex) => classifyColor(hex, config));
}

/** Saves the cut-offs as a new version, makes it active and re-classifies the category's shades. */
export async function createVersion(input: ConfigInput, actorId: string) {
  if (!(await repository.findFormat(input.productFormatId))) fail("NOT_FOUND", "Category not found", "FORMAT_NOT_FOUND");
  checkRules(input.config);
  return db.transaction(async (tx) => {
    const row = await repository.createActiveVersion(tx, input, actorId);
    await reclassify(tx, input.productFormatId, input.config);
    return row;
  });
}

/** Rollback: makes an older version active again. Versions are never edited. */
export async function activate(id: string, actorId: string) {
  const version = await repository.findVersion(id);
  if (!version) fail("NOT_FOUND", "Config version not found", "CONFIG_NOT_FOUND");
  if (version.isActive) fail("CONFLICT", "This version is already active", "ALREADY_ACTIVE");
  return db.transaction(async (tx) => {
    const row = await repository.activateVersion(tx, version, actorId);
    await reclassify(tx, version.productFormatId, version.config as ClassificationConfig);
    return row;
  });
}
