// Turns color numbers into labels (undertone, season, family, value, chroma).
// Thresholds are data (ClassificationConfig) so an admin can change them; the active
// config per category is stored in `classification_config_versions.config`.
import { z } from "zod";
import { type ColorMetrics, colorMetrics } from "./color.js";

/** GET /api/classification-configs/active: the config of the sub-category's category. */
export const activeConfigQuery = z.object({ productFormatItemId: z.coerce.number().int().positive() }).strict();
export const configListQuery = z.object({ productFormatId: z.coerce.number().int().positive() }).strict();

// Shape of a config sent by the admin page. Same fields as the interfaces below.
// Hue is in degrees, lightness in percent; LCh chroma (the saturation of that model) can pass 100.
const range = (limit: number) => z.object({ min: z.number().min(0).max(limit), max: z.number().min(0).max(limit) }).strict();
const classRule = z
  .object({
    label: z.string().trim().min(1).max(60),
    hue: range(360).optional(),
    lightness: range(100).optional(),
    saturation: range(200).optional(),
  })
  .strict();
const ruleGroup = z.object({ model: z.enum(["hsl", "lch"]), rules: z.array(classRule).min(1).max(50) }).strict();
export const classificationConfig = z
  .object({
    undertone: ruleGroup,
    season: ruleGroup,
    hueMunsell: ruleGroup,
    colorFamily: ruleGroup,
    colorSub: z
      .array(classRule.extend({ family: z.string().trim().min(1).max(60) }).strict())
      .max(50)
      .optional(),
    valueClass: ruleGroup,
    chromaClass: ruleGroup,
  })
  .strict();

/** A new version of a category's cut-offs. It becomes the active one. */
export const configInput = z
  .object({ productFormatId: z.number().int().positive(), config: classificationConfig, note: z.string().trim().max(255).optional() })
  .strict();
export type ConfigInput = z.infer<typeof configInput>;

export interface ConfigVersion {
  id: string;
  version: number;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  config: ClassificationConfig;
}

/** Which numbers a rule group reads: HSL (h, l, s) or LCh (h, L, C). */
export type ColorModel = "hsl" | "lch";

/**
 * Inclusive range. For hue, `min > max` wraps around 0°:
 * { min: 355, max: 5 } matches 355–360 and 0–5.
 */
export interface Range {
  min: number;
  max: number;
}

/** A rule matches when every range it sets matches. A rule with no ranges always matches (the "else"). */
export interface ClassRule {
  label: string;
  hue?: Range;
  lightness?: Range;
  /** HSL saturation or LCh chroma, depending on the group's model. */
  saturation?: Range;
}

/** Splits one color family into sub-columns (Peach: More Orange / More Pink). Read in the colorFamily model. */
export interface SubRule extends ClassRule {
  /** Label of the colorFamily rule this sub belongs to. */
  family: string;
}

export const rangeKeys = ["hue", "lightness", "saturation"] as const;

/** Top of the scale of a number a rule checks (it starts at 0). LCh chroma has no fixed top: 200 is above any sRGB color. */
export const scaleMax = (key: (typeof rangeKeys)[number], model: ColorModel) =>
  key === "hue" ? 360 : key === "saturation" && model === "lch" ? 200 : 100;

/** Rules for one label. Checked top to bottom; the first match wins. */
export interface RuleGroup {
  model: ColorModel;
  rules: ClassRule[];
}

/** Every number a rule checks, set to its whole scale: the rule accepts any value until a range is narrowed. */
export const wholeScale = (model: ColorModel) =>
  Object.fromEntries(rangeKeys.map((key) => [key, { min: 0, max: scaleMax(key, model) }])) as Record<(typeof rangeKeys)[number], Range>;

/**
 * Each label picks its own model. Lips (brief): undertone and season from HSL,
 * Hue Munsell, value and chroma from LCh.
 */
export interface ClassificationConfig {
  undertone: RuleGroup;
  season: RuleGroup;
  hueMunsell: RuleGroup;
  colorFamily: RuleGroup;
  /** Optional: configs stored before sub-families existed do not have it. A family without rules here has no sub. */
  colorSub?: SubRule[];
  valueClass: RuleGroup;
  chromaClass: RuleGroup;
}

function inRange(value: number, { min, max }: Range) {
  return min <= max ? value >= min && value <= max : value >= min || value <= max;
}

/** Label of the first rule that matches, or null when none does. */
export function matchRule(rules: ClassRule[], color: { hue: number; lightness: number; saturation: number }) {
  const rule = rules.find(
    (r) =>
      (!r.hue || inRange(color.hue, r.hue)) &&
      (!r.lightness || inRange(color.lightness, r.lightness)) &&
      (!r.saturation || inRange(color.saturation, r.saturation)),
  );
  return rule?.label ?? null;
}

/** Label from one rule group, reading the numbers of the group's model. */
function classify(group: RuleGroup, metrics: ColorMetrics) {
  const color =
    group.model === "hsl"
      ? { hue: metrics.hslH, lightness: metrics.hslL, saturation: metrics.hslS }
      : {
          hue: metrics.lchH,
          lightness: metrics.lchL,
          saturation: metrics.lchC,
        };
  return matchRule(group.rules, color);
}

/** Numbers + labels for one HEX, using the given config. */
export function classifyColor(hex: string, config: ClassificationConfig) {
  const metrics = colorMetrics(hex);
  const colorFamily = classify(config.colorFamily, metrics);
  const subRules = (config.colorSub ?? []).filter((rule) => rule.family === colorFamily);
  return {
    ...metrics,
    undertone: classify(config.undertone, metrics),
    season: classify(config.season, metrics),
    hueMunsell: classify(config.hueMunsell, metrics),
    colorFamily,
    colorSub: classify({ model: config.colorFamily.model, rules: subRules }, metrics),
    valueClass: classify(config.valueClass, metrics),
    chromaClass: classify(config.chromaClass, metrics),
  };
}

export const munsellHues: Record<string, string> = {
  R: "Red",
  YR: "Yellow-Red",
  Y: "Yellow",
  GY: "Green-Yellow",
  G: "Green",
  BG: "Blue-Green",
  B: "Blue",
  PB: "Purple-Blue",
  P: "Purple",
  RP: "Red-Purple",
};
