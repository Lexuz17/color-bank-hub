import type { DataInputIssue } from "@color-bank-hub/contracts/data-input";
import { readSheet } from "read-excel-file/browser";
import { readComposition } from "./composition";

export const MAX_ROWS = 500;

// Header names of sheet "Shades" in public/templates/shade-import-template.xlsx. Every one must exist.
const columns = {
  origin: "Origin",
  brand: "Brand",
  productName: "Product Name",
  subCategoryCode: "Sub-Category Code",
  shadeName: "Shade Name",
  sku: "SKU",
  hex: "HEX Code",
  ingredientsInci: "Full Ingredients (INCI)",
  mayContain: "May Contain",
  composition: "Color Composition",
  benchmarkBrand: "Benchmark Brand",
  benchmarkProduct: "Benchmark Product",
  benchmarkShade: "Benchmark Shade",
  lipPhoto: "Lip Photo File",
  swatchPhoto: "Swatch Photo File",
} as const;

export interface TemplateRow {
  /** One row of the preview request: names, not ids. */
  data: Record<string, unknown>;
  display: { brand: string; productName: string; shadeName: string; hex: string; subCategoryCode: string };
  lipPhotoFile?: string;
  swatchPhotoFile?: string;
  /** Problems found while reading the cells, before the API sees the row. */
  issues: DataInputIssue[];
}

export type TemplateResult = { rows: TemplateRow[] } | { error: string };

const issue = (path: string, reason: string, message: string): DataInputIssue => ({ path, reason, message });

export async function readTemplate(file: File): Promise<TemplateResult> {
  let matrix: unknown[][];
  try {
    matrix = await readSheet(file, "Shades");
  } catch {
    return { error: 'Cannot read this file. Use the template: an .xlsx with a sheet named "Shades".' };
  }

  const header = (matrix[0] ?? []).map((cell) =>
    String(cell ?? "")
      .trim()
      .toLowerCase(),
  );
  const missing = Object.values(columns).filter((label) => !header.includes(label.toLowerCase()));
  if (missing.length) return { error: `Column not found: ${missing.join(", ")}. Do not rename or remove the template header.` };
  const at = Object.fromEntries(Object.entries(columns).map(([field, label]) => [field, header.indexOf(label.toLowerCase())])) as Record<
    keyof typeof columns,
    number
  >;

  const body = matrix.slice(1);
  while (body.length && body[body.length - 1].every((cell) => String(cell ?? "").trim() === "")) body.pop();
  if (body.length === 0) return { error: "No data rows found under the header." };
  if (body.length > MAX_ROWS) return { error: `Maximum ${MAX_ROWS} rows per file, this file has ${body.length}.` };

  const rows = body.map((cells): TemplateRow => {
    const cell = (field: keyof typeof columns) => String(cells[at[field]] ?? "").trim() || undefined;
    const issues: DataInputIssue[] = [];

    const compositionText = cell("composition");
    const composition = compositionText ? readComposition(compositionText) : undefined;
    if (compositionText && !composition) {
      issues.push(issue("composition", "COMPOSITION_FORMAT", 'Write it as "name: percent; name: percent", e.g. Red 7 Lake: 20.2; Orange 851: 10'));
    }

    const benchmark = { brand: cell("benchmarkBrand"), product: cell("benchmarkProduct"), shade: cell("benchmarkShade") };
    const benchmarkFilled = Object.values(benchmark).filter(Boolean).length;
    if (benchmarkFilled > 0 && benchmarkFilled < 3) {
      issues.push(issue("benchmark", "BENCHMARK_INCOMPLETE", "Fill Benchmark Brand, Product and Shade together, or leave all three empty"));
    }

    return {
      data: {
        origin: cell("origin"),
        brand: cell("brand"),
        productName: cell("productName"),
        subCategoryCode: cell("subCategoryCode"),
        shadeName: cell("shadeName"),
        sku: cell("sku"),
        hex: cell("hex"),
        ingredientsInci: cell("ingredientsInci"),
        mayContain: cell("mayContain"),
        composition,
        benchmark: benchmarkFilled === 3 ? benchmark : undefined,
      },
      display: {
        brand: cell("brand") ?? "",
        productName: cell("productName") ?? "",
        shadeName: cell("shadeName") ?? "",
        hex: cell("hex") ?? "",
        subCategoryCode: cell("subCategoryCode") ?? "",
      },
      lipPhotoFile: cell("lipPhoto"),
      swatchPhotoFile: cell("swatchPhoto"),
      issues,
    };
  });
  return { rows };
}
