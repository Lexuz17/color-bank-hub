import { z } from "zod";
import { type ApiIssue, hex, name } from "./common.js";

const origin = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z.enum(["own", "external"], "Must be own or external"),
);

export const dataInputRow = z
  .object({
    origin,
    brand: name,
    productName: name,
    subCategoryCode: z.string().trim().toUpperCase().min(1).max(4),
    shadeName: name,
    sku: name.optional(),
    hex,
    ingredientsInci: z.string().trim().min(1).max(20000),
    mayContain: z.string().max(20000).optional(),
    composition: z
      .array(z.object({ name, percentage: z.number().min(0).max(100) }).strict())
      .max(100)
      .optional(),
    benchmark: z.object({ brand: name, product: name, shade: name }).strict().optional(),
    lipPhotoKey: z.string().max(500).optional(),
    swatchPhotoKey: z.string().max(500).optional(),
  })
  .strict();
export type DataInputRow = z.infer<typeof dataInputRow>;

// Rows stay unknown here on purpose: the service checks each one so the preview can report every error of every row at once.
export const previewDataInputRequest = z.object({ rows: z.array(z.unknown()).min(1).max(500) }).strict();
export type PreviewDataInputRequest = z.infer<typeof previewDataInputRequest>;

export const commitDataInputRequest = previewDataInputRequest;
export type CommitDataInputRequest = PreviewDataInputRequest;

/** `reason` is the specific cause, e.g. DUPLICATE_SKU; shape errors use VALIDATION_ERROR. */
export interface DataInputIssue extends ApiIssue {
  reason: string;
}

export interface DataInputPreviewRow {
  row: number;
  valid: boolean;
  errors: DataInputIssue[];
  warnings: DataInputIssue[];
  computed?: {
    colorFamily: string | null;
    undertone: string | null;
    season: string | null;
    valueClass: string | null;
    chromaClass: string | null;
    isNewBrand: boolean;
    isNewProduct: boolean;
  };
}

export interface DataInputPreviewResponse {
  valid: boolean;
  rowCount: number;
  validCount: number;
  newBrandCount: number;
  newProductCount: number;
  rows: DataInputPreviewRow[];
}

export interface DataInputCommitResponse {
  imported: number;
  createdBrands: number;
  createdProducts: number;
}
