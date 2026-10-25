import { shadeInput, type ShadeInput } from "#api/models/catalog.js";
import {
  createShades,
  validateShadeRows,
} from "#api/repositories/catalog-repository.js";
import { fail } from "#api/core/errors.js";
export async function previewImport(rows: unknown[]) {
  const parsed = rows.map((row) => shadeInput.safeParse(row));
  const validRows = parsed
    .filter((result) => result.success)
    .map((result) => result.data!);
  const databaseErrors = await validateShadeRows(validRows);
  let validIndex = 0;
  const seen = new Set<string>();
  const result = parsed.map((parsedRow, index) => {
    if (!parsedRow.success)
      return {
        row: index + 1,
        valid: false,
        errors: parsedRow.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      };
    const row = parsedRow.data;
    const dbError = databaseErrors[validIndex++];
    const duplicate = seen.has(row.sku);
    seen.add(row.sku);
    const error = dbError ?? (duplicate ? "Duplicate SKU within import" : null);
    return {
      row: index + 1,
      valid: !error,
      data: row,
      errors: error ? [{ path: "", message: error }] : [],
    };
  });
  return {
    valid: result.every((row) => row.valid),
    rowCount: result.length,
    validCount: result.filter((row) => row.valid).length,
    rows: result,
  };
}
export async function commitImport(rows: unknown[]) {
  const preview = await previewImport(rows);
  if (!preview.valid)
    fail(
      422,
      "IMPORT_INVALID",
      "Import contains invalid rows. Preview and correct all rows before committing.",
    );
  const items = await createShades(
    preview.rows.map((row) => row.data as ShadeInput),
  );
  return { imported: items.length, items };
}
