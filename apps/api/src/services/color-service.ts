/** sRGB / D65 conversion. Business season and undertone rules are intentionally not guessed. */
export function colorMetrics(hex: string) {
  const [r, g, b] = [1, 3, 5].map((index) =>
    parseInt(hex.slice(index, index + 2), 16),
  );
  const [red, green, blue] = [r, g, b].map((channel) => channel / 255);
  const max = Math.max(red, green, blue),
    min = Math.min(red, green, blue),
    delta = max - min;
  const l = (max + min) / 2;
  let hue =
    delta === 0
      ? 0
      : max === red
        ? 60 * (((green - blue) / delta) % 6)
        : max === green
          ? 60 * ((blue - red) / delta + 2)
          : 60 * ((red - green) / delta + 4);
  hue = (hue + 360) % 360;
  const linear = [red, green, blue].map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  const [lr, lg, lb] = linear;
  const x = (lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375) / 0.95047;
  const y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175;
  const z = (lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041) / 1.08883;
  const f = (value: number) =>
    value > 216 / 24389 ? Math.cbrt(value) : ((24389 / 27) * value + 16) / 116;
  const labL = 116 * f(y) - 16,
    labA = 500 * (f(x) - f(y)),
    labB = 200 * (f(y) - f(z));
  const round = (value: number) => Math.round(value * 100) / 100;
  return {
    r,
    g,
    b,
    hslH: round(hue),
    hslS: round(delta === 0 ? 0 : (delta / (1 - Math.abs(2 * l - 1))) * 100),
    hslL: round(l * 100),
    hsbS: round(max === 0 ? 0 : (delta / max) * 100),
    hsbB: round(max * 100),
    labL: round(labL),
    labA: round(labA),
    labB: round(labB),
    lchL: round(labL),
    lchC: round(Math.hypot(labA, labB)),
    lchH: round(((Math.atan2(labB, labA) * 180) / Math.PI + 360) % 360),
  };
}
