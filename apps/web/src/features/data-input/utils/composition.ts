export function readComposition(text: string) {
  const items: { name: string; percentage: number }[] = [];
  for (const part of text.split(/[;\n]/)) {
    if (!part.trim()) continue;
    const colon = part.lastIndexOf(":");
    const percentage = Number(
      part
        .slice(colon + 1)
        .replace("%", "")
        .replace(",", ".")
        .trim(),
    );
    const name = part.slice(0, colon).trim();
    if (colon < 1 || !name || part.slice(colon + 1).trim() === "" || Number.isNaN(percentage)) return undefined;
    items.push({ name, percentage });
  }
  return items;
}
