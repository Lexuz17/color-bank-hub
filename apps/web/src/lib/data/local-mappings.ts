export interface SavedMapping {
  id: string;
  name: string;
  shadeNames: string[];
  pinned: boolean;
  updated: string;
}
const key = "color-bank-demo-mappings";
export function readMappings(): SavedMapping[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(data)
      ? data.filter(
          (item): item is SavedMapping =>
            !!item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.pinned === "boolean" &&
            typeof item.updated === "string" &&
            Array.isArray(item.shadeNames) &&
            item.shadeNames.every((name: unknown) => typeof name === "string"),
        )
      : [];
  } catch {
    return [];
  }
}
export function writeMappings(items: SavedMapping[]) {
  localStorage.setItem(key, JSON.stringify(items));
}
