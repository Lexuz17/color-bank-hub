// Legacy endpoints of the old Data Input page. They go away with the new flow: see apps/api/src/controllers/data-input-controller.ts.
import type { Brand, BrandInput, FormatInput, Product, ProductFormat, ProductInput } from "@color-bank-hub/contracts/catalog";
import type { ImportPreview, ImportResult } from "@color-bank-hub/contracts/import";
import type { ShadeInput, StoredShade } from "@color-bank-hub/contracts/shade";
import { post } from "@/lib/http";

export function createBrand(body: BrandInput) {
  return post<Brand>("/brands", body);
}

export function createFormat(body: FormatInput) {
  return post<ProductFormat>("/product-formats", body);
}

export function createProduct(body: ProductInput) {
  return post<Product>("/products", body);
}

export function createShade(body: ShadeInput) {
  return post<StoredShade>("/shades", body);
}

export function previewImport(rows: unknown[]) {
  return post<ImportPreview>("/imports/preview", { rows });
}

export function commitImport(rows: unknown[]) {
  return post<ImportResult>("/imports/commit", { rows });
}
