// HEX -> RGB, HSL, HSB, CIE Lab and LCh (sRGB, D65 white point). Fixed formulas, no business rules.
// Why in contracts and not only in the API:
// - Web: Data Input auto-fills color fields the moment a HEX is typed when manual entry,
//   via classifyColor() in color-classification.ts. No request needed.
// - API: recalculates from the HEX on save; browser values are never trusted.
// If instant auto-fill is dropped, move this file and color-classification.ts to apps/api.
// Labels such as undertone or season live in color-classification.ts.

const round = (value: number) => Math.round(value * 100) / 100;

/** "#aa6d78" -> { r: 170, g: 109, b: 120 } */
export function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

type Rgb = ReturnType<typeof hexToRgb>;

/** Hue in degrees (0–360), shared by HSL and HSB. */
function hueOf(red: number, green: number, blue: number) {
  const max = Math.max(red, green, blue);
  const delta = max - Math.min(red, green, blue);
  if (delta === 0) return 0;
  let hue: number;
  if (max === red) hue = ((green - blue) / delta) % 6;
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;
  return (hue * 60 + 360) % 360;
}

/** Hue 0–360, saturation and lightness 0–100. */
export function rgbToHsl({ r, g, b }: Rgb) {
  const [red, green, blue] = [r / 255, g / 255, b / 255];
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  return {
    h: hueOf(red, green, blue),
    s: saturation * 100,
    l: lightness * 100,
  };
}

/** HSB (also called HSV): saturation and brightness 0–100. */
export function rgbToHsb({ r, g, b }: Rgb) {
  const [red, green, blue] = [r / 255, g / 255, b / 255];
  const max = Math.max(red, green, blue);
  const delta = max - Math.min(red, green, blue);
  return {
    h: hueOf(red, green, blue),
    s: max === 0 ? 0 : (delta / max) * 100,
    b: max * 100,
  };
}

/** CIE Lab via linear RGB and XYZ, normalized to the D65 white point. */
export function rgbToLab({ r, g, b }: Rgb) {
  const toLinear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];

  const x = (lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375) / 0.95047;
  const y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175;
  const z = (lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041) / 1.08883;

  const f = (value: number) =>
    value > 216 / 24389 ? Math.cbrt(value) : ((24389 / 27) * value + 16) / 116;
  return {
    l: 116 * f(y) - 16,
    a: 500 * (f(x) - f(y)),
    b: 200 * (f(y) - f(z)),
  };
}

/** LCh: Lab in polar form. Chroma = distance from grey, hue = angle 0–360. */
export function labToLch({ l, a, b }: ReturnType<typeof rgbToLab>) {
  return {
    l,
    c: Math.hypot(a, b),
    h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360,
  };
}

/** Every numeric color value stored on a shade (column names of `shades`). */
export function colorMetrics(hex: string) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const hsb = rgbToHsb(rgb);
  const lab = rgbToLab(rgb);
  const lch = labToLch(lab);
  return {
    ...rgb,
    hslH: round(hsl.h),
    hslS: round(hsl.s),
    hslL: round(hsl.l),
    hsbS: round(hsb.s),
    hsbB: round(hsb.b),
    labL: round(lab.l),
    labA: round(lab.a),
    labB: round(lab.b),
    lchL: round(lch.l),
    lchC: round(lch.c),
    lchH: round(lch.h),
  };
}

export type ColorMetrics = ReturnType<typeof colorMetrics>;
