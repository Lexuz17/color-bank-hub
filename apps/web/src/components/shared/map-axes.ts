// Math for the shade map: which numbers an axis shows, how a value becomes a position,
// and how classification rules become background regions. No React here.
import type { ColorMetrics } from "@color-bank-hub/contracts/color";
import type { ColorModel, Range, RuleGroup } from "@color-bank-hub/contracts/color-classification";

/** Attributes a user may put on an axis. `hue` axes are circular (0° = 360°). */
export const axes = {
  hslH: { label: "Hue (HSL)", hue: true, min: 0, max: 360 },
  hslS: { label: "Saturation (HSL)", hue: false, min: 0, max: 100 },
  hslL: { label: "Lightness (HSL)", hue: false, min: 0, max: 100 },
  hsbS: { label: "Saturation (HSB)", hue: false, min: 0, max: 100 },
  hsbB: { label: "Brightness (HSB)", hue: false, min: 0, max: 100 },
  labL: { label: "Lightness L* (Lab)", hue: false, min: 0, max: 100 },
  labA: { label: "a* green–red (Lab)", hue: false, min: -100, max: 100 },
  labB: { label: "b* blue–yellow (Lab)", hue: false, min: -100, max: 100 },
  lchL: { label: "Lightness L* (LCh)", hue: false, min: 0, max: 100 },
  lchC: { label: "Chroma C* (LCh)", hue: false, min: 0, max: 100 },
  lchH: { label: "Hue h° (LCh)", hue: true, min: 0, max: 360 },
} as const satisfies Partial<Record<keyof ColorMetrics, { label: string; hue: boolean; min: number; max: number }>>;

export type AxisKey = keyof typeof axes;
export const axisKeys = Object.keys(axes) as AxisKey[];

/** Hue and lightness attributes a rule group reads, by its model. */
export const modelAxes: Record<ColorModel, { hue: AxisKey; lightness: AxisKey }> = {
  hsl: { hue: "hslH", lightness: "hslL" },
  lch: { hue: "lchH", lightness: "lchL" },
};

/** Visible part of an axis: values run from `start` over `span`. A hue domain may cross 0°. */
export interface Domain {
  start: number;
  span: number;
  hue: boolean;
}

// Brief (lips): the hue axis shows at least 315°–30°. It widens when a shade falls outside.
const HUE_ANCHORS = [315, 30];
const HUE_PADDING = 5;

/** Fit the axis to the values. A hue axis is cut at the largest empty arc, so reds around 0° stay together. */
export function domainOf(key: AxisKey, values: number[]): Domain {
  const axis = axes[key];
  if (!axis.hue) {
    const start = Math.min(axis.min, ...values);
    return { start, span: Math.max(axis.max, ...values) - start, hue: false };
  }
  // Shades get a little room on both sides; the anchors do not, so no sliver of a neighbor region shows past them.
  const padded = values.flatMap((value) => [value - HUE_PADDING, value + HUE_PADDING]).map((value) => (value + 360) % 360);
  const points = [...new Set([...HUE_ANCHORS, ...padded])].sort((a, b) => a - b);
  let cut = 0;
  let widest = -1;
  points.forEach((point, index) => {
    const gap = (points[(index + 1) % points.length] - point + 360) % 360;
    if (gap > widest) {
      widest = gap;
      cut = index;
    }
  });
  const span = 360 - widest;
  // Almost the whole circle is used: show all of it instead of an awkward cut.
  if (span >= 340) return { start: 0, span: 360, hue: true };
  return { start: points[(cut + 1) % points.length], span, hue: true };
}

/** Where a value sits on the axis, counted from the domain start (a hue past 360° continues instead of wrapping). */
export function offsetOf(value: number, domain: Domain) {
  return domain.hue ? (value - domain.start + 360) % 360 : value - domain.start;
}

/** Pieces of [0, 1] that a rule range covers on an axis. No range = the whole axis. */
function coverOf(range: Range | undefined, domain: Domain): [number, number][] {
  // A whole-scale hue (0–360) is no boundary either: it must not cut the axis at 0°.
  if (!range || (domain.hue && range.max - range.min >= 360)) return [[0, 1]];
  const clip = (from: number, to: number): [number, number][] => {
    const a = Math.max(0, from / domain.span);
    const b = Math.min(1, to / domain.span);
    return b > a ? [[a, b]] : [];
  };
  if (!domain.hue) return clip(range.min - domain.start, range.max - domain.start);
  // A hue range may wrap past 0°, and so may the axis: split it into at most two pieces.
  const from = (range.min - domain.start + 360) % 360;
  const length = range.max - range.min >= 360 ? 360 : (range.max - range.min + 360) % 360;
  return [...clip(from, Math.min(from + length, 360)), ...(from + length > 360 ? clip(0, from + length - 360) : [])];
}

export interface Region {
  label: string;
  /** Fractions of the plot: x and width from the left, y and height from the bottom. */
  x: number;
  y: number;
  width: number;
  height: number;
}

const inside = (value: number, pieces: [number, number][]) => pieces.some(([from, to]) => value >= from && value <= to);

/**
 * Background of a rule group on hue (x) × lightness (y): the plot is cut at every rule boundary and each
 * cell gets the label of the first rule that matches it, like matchRule(). Cells of one label touch, so
 * they read as one area. shortcut: a rule's saturation range cannot be drawn in 2D and is ignored.
 */
export function regionsOf(group: RuleGroup, x: Domain, y: Domain): Region[] {
  const rules = group.rules.map((rule) => ({ label: rule.label, x: coverOf(rule.hue, x), y: coverOf(rule.lightness, y) }));
  const edges = (pick: "x" | "y") => [...new Set([0, 1, ...rules.flatMap((rule) => rule[pick].flat())])].sort((a, b) => a - b);
  const xs = edges("x");
  const ys = edges("y");
  const regions: Region[] = [];
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const rule = rules.find((entry) => inside((xs[i] + xs[i + 1]) / 2, entry.x) && inside((ys[j] + ys[j + 1]) / 2, entry.y));
      // A cell no rule matches keeps an empty label, so the lines around it are still drawn.
      regions.push({ label: rule?.label ?? "", x: xs[i], y: ys[j], width: xs[i + 1] - xs[i], height: ys[j + 1] - ys[j] });
    }
  }
  return regions;
}

/**
 * The cell of each label where its caption goes: one in a corner of the plot when the label has one, else its largest.
 * A corner cell keeps the caption in place when another rule's boundary cuts the label into more cells.
 */
export function captionsOf(regions: Region[]) {
  const edge = (from: number, size: number) => from < 1e-9 || from + size > 1 - 1e-9;
  const inCorner = (cell: Region) => edge(cell.x, cell.width) && edge(cell.y, cell.height);
  const picked = new Map<string, Region>();
  for (const region of regions) {
    if (!region.label) continue;
    const current = picked.get(region.label);
    const better =
      current && (inCorner(region) === inCorner(current) ? region.width * region.height > current.width * current.height : inCorner(region));
    if (!current || better) picked.set(region.label, region);
  }
  return [...picked.values()];
}

/** Lines between neighboring cells of different labels, as [x1, y1, x2, y2] in plot fractions. */
export function bordersOf(regions: Region[]) {
  const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;
  return regions.flatMap((cell) => {
    const right = cell.x + cell.width;
    const top = cell.y + cell.height;
    const lines: [number, number, number, number][] = [];
    if (regions.some((other) => other.label !== cell.label && near(other.x, right) && near(other.y, cell.y))) lines.push([right, cell.y, right, top]);
    if (regions.some((other) => other.label !== cell.label && near(other.y, top) && near(other.x, cell.x))) lines.push([cell.x, top, right, top]);
    return lines;
  });
}
