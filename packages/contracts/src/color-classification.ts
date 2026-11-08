// Turns color numbers into labels (undertone, season, family, value, chroma).
// Thresholds are data (ClassificationConfig) so an admin can change them; the active
// config per category is stored in `classification_config_versions.config`.
import { type ColorMetrics, colorMetrics } from "./color.js";

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

/** Rules for one label. Checked top to bottom; the first match wins. */
export interface RuleGroup {
  model: ColorModel;
  rules: ClassRule[];
}

/**
 * Each label picks its own model. Lips (brief): undertone and season from HSL,
 * Hue Munsell, value and chroma from LCh.
 */
export interface ClassificationConfig {
  undertone: RuleGroup;
  season: RuleGroup;
  hueMunsell: RuleGroup;
  colorFamily: RuleGroup;
  valueClass: RuleGroup;
  chromaClass: RuleGroup;
}

function inRange(value: number, { min, max }: Range) {
  return min <= max
    ? value >= min && value <= max
    : value >= min || value <= max;
}

/** Label of the first rule that matches, or null when none does. */
export function matchRule(
  rules: ClassRule[],
  color: { hue: number; lightness: number; saturation: number },
) {
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
  return {
    ...metrics,
    undertone: classify(config.undertone, metrics),
    season: classify(config.season, metrics),
    hueMunsell: classify(config.hueMunsell, metrics),
    colorFamily: classify(config.colorFamily, metrics),
    valueClass: classify(config.valueClass, metrics),
    chromaClass: classify(config.chromaClass, metrics),
  };
}
