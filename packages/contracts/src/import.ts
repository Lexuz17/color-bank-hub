import { z } from "zod";
import type { ApiIssue } from "./common.js";
import type { ShadeInput, StoredShade } from "./shade.js";

export const importInput = z
  .object({ rows: z.array(z.unknown()).min(1).max(500) })
  .strict();

interface ImportPreviewRow {
  row: number;
  valid: boolean;
  data?: ShadeInput;
  errors: ApiIssue[];
}
export interface ImportPreview {
  valid: boolean;
  rowCount: number;
  validCount: number;
  rows: ImportPreviewRow[];
}
export interface ImportResult {
  imported: number;
  items: StoredShade[];
}
