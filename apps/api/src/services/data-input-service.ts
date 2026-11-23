import { breaksBenchmarkRule } from "@color-bank-hub/contracts/catalog";
import { classifyColor } from "@color-bank-hub/contracts/color-classification";
import {
  type DataInputCommitResponse,
  type DataInputIssue,
  type DataInputPreviewResponse,
  type DataInputPreviewRow,
  type DataInputRow,
  dataInputRow,
} from "@color-bank-hub/contracts/data-input";
import { fail } from "#api/core/errors.js";
import { db } from "#api/lib/db.js";
import type { AuthUser } from "#api/middleware/auth.js";
import { createBrand, findBrandsByNames } from "#api/services/brand-service.js";
import { findActive } from "#api/services/classification-config-service.js";
import { listFormatItemsByCodes } from "#api/services/product-format-service.js";
import { createProduct, findProductsByNames } from "#api/services/product-service.js";
import { createBenchmarks, createClassifiedShade, findBenchmarkCandidates, findShadesForImport } from "#api/services/shade-service.js";
import { verifyUpload } from "#api/services/upload-service.js";
// Names match ignoring case and edge spaces, as the lookups in the lower modules do.
const key = (value: string) => value.trim().toLowerCase();
const productKey = (brand: string, product: string) => `${key(brand)}|${key(product)}`;
const shadeKey = (brand: string, product: string, shade: string) => `${productKey(brand, product)}|${key(shade)}`;
const issue = (path: string, reason: string, message: string): DataInputIssue => ({ path, reason, message });

type FileShade = { row: number; isOwn: boolean; code: string };

// Rules that need only the row and one lookup result.

function checkComposition(row: DataInputRow) {
  const total = (row.composition ?? []).reduce((sum, entry) => sum + entry.percentage, 0);
  if (total <= 100.000001) return [];
  return [issue("composition", "COMPOSITION_OVER_100", `Composition adds up to ${total}%, the maximum is 100%`)];
}

/** The benchmark may be in the database or in this file; it must be external. A sub-category clash is only a warning. */
function checkBenchmark(row: DataInputRow, fileShades: Map<string, FileShade>, dbBenchmarkByKey: Map<string, { isOwn: boolean; code: string }>) {
  if (!row.benchmark) return { errors: [], warnings: [] };
  const { brand, product, shade } = row.benchmark;
  const target = fileShades.get(shadeKey(brand, product, shade)) ?? dbBenchmarkByKey.get(shadeKey(brand, product, shade));
  if (!target) {
    const message = `Benchmark "${brand} ${product} ${shade}" is not in the database or in this file`;
    return { errors: [issue("benchmark", "BENCHMARK_NOT_FOUND", message)], warnings: [] };
  }
  if (target.isOwn) return { errors: [issue("benchmark", "BENCHMARK_NOT_FOUND", "A benchmark must be an external shade")], warnings: [] };
  if (!breaksBenchmarkRule([row.subCategoryCode, target.code])) return { errors: [], warnings: [] };
  const message = "This sub-category is not normally benchmarked against that shade's sub-category";
  return { errors: [], warnings: [issue("benchmark", "BENCHMARK_FORMAT_NOT_ALLOWED", message)] };
}

/** Checks every row and returns every error at once. Reads only: nothing is saved. */
async function analyze(rawRows: unknown[]) {
  const parsed = rawRows.map((raw) => dataInputRow.safeParse(raw));
  const rows = parsed.flatMap((result) => (result.success ? [result.data] : []));

  // What the database already has: one query per kind.
  const [dbBrands, dbItems] = await Promise.all([
    findBrandsByNames(rows.map((row) => row.brand)),
    listFormatItemsByCodes(rows.map((row) => row.subCategoryCode)),
  ]);
  const dbProducts = await findProductsByNames(
    dbBrands.map((brand) => brand.id),
    rows.map((row) => row.productName),
  );
  const [dbShades, dbBenchmarks, configs] = await Promise.all([
    findShadesForImport({
      productIds: dbProducts.map((product) => product.id),
      names: rows.map((row) => row.shadeName),
      skus: rows.flatMap((row) => (row.sku ? [row.sku] : [])),
    }),
    findBenchmarkCandidates(rows.flatMap((row) => (row.benchmark ? [row.benchmark.shade] : []))),
    Promise.all([...new Set(dbItems.map((item) => item.id))].map(async (id) => [id, await findActive(id)] as const)),
  ]);
  const brandNameById = new Map(dbBrands.map((brand) => [brand.id, brand.name]));
  const brandByKey = new Map(dbBrands.map((brand) => [key(brand.name), brand]));
  const productByKey = new Map(dbProducts.map((product) => [productKey(brandNameById.get(product.brandId) ?? "", product.name), product]));
  const itemByCode = new Map(dbItems.map((item) => [item.code, item]));
  const configByItemId = new Map(configs);
  const existingShades = new Set(dbShades.map((shade) => `${shade.productId}|${key(shade.name)}`));
  const existingSkus = new Set(dbShades.flatMap((shade) => (shade.sku ? [shade.sku] : [])));
  const dbBenchmarkByKey = new Map(dbBenchmarks.map((shade) => [shadeKey(shade.brand, shade.product, shade.name), shade]));

  // What the file itself claims. A later row that repeats a claim of an earlier row is the one in error.
  // First row of each shade: filled before the loop because a benchmark may point to a row further down.
  const fileShades = new Map<string, FileShade>();
  parsed.forEach((result, index) => {
    if (!result.success) return;
    const { brand, productName, shadeName, origin, subCategoryCode } = result.data;
    const id = shadeKey(brand, productName, shadeName);
    if (!fileShades.has(id)) fileShades.set(id, { row: index + 1, isOwn: origin === "own", code: subCategoryCode });
  });
  const fileBrandOrigins = new Map<string, string>(); // brands not in the database: brand key -> origin of the first row
  const fileProductCodes = new Map<string, string>(); // products not in the database: product key -> sub-category of the first row
  const fileSkus = new Map<string, number>(); // sku -> first row

  const result = parsed.map((item, index): DataInputPreviewRow => {
    const row = index + 1;
    if (!item.success) {
      const errors = item.error.issues.map((zodIssue) => issue(zodIssue.path.join("."), "VALIDATION_ERROR", zodIssue.message));
      return { row, valid: false, errors, warnings: [] };
    }
    const data = item.data;
    const errors: DataInputIssue[] = [];
    const brandId = key(data.brand);
    const productId = productKey(data.brand, data.productName);
    const dbBrand = brandByKey.get(brandId);
    const dbProduct = productByKey.get(productId);
    const subCategory = itemByCode.get(data.subCategoryCode);

    if (!subCategory) errors.push(issue("subCategoryCode", "UNKNOWN_SUB_CATEGORY", `Sub-category "${data.subCategoryCode}" does not exist`));

    const knownOrigin = dbBrand ? (dbBrand.isOwn ? "own" : "external") : fileBrandOrigins.get(brandId);
    if (knownOrigin !== undefined && knownOrigin !== data.origin) {
      errors.push(issue("origin", "BRAND_ORIGIN_MISMATCH", `Brand "${data.brand}" is ${knownOrigin}, not ${data.origin}`));
    }
    if (!dbBrand && !fileBrandOrigins.has(brandId)) fileBrandOrigins.set(brandId, data.origin);

    const fileCode = fileProductCodes.get(productId);
    const isProductMismatch = dbProduct
      ? subCategory !== undefined && dbProduct.productFormatItemId !== subCategory.id
      : fileCode !== undefined && fileCode !== data.subCategoryCode;
    if (isProductMismatch) {
      errors.push(issue("subCategoryCode", "PRODUCT_FORMAT_MISMATCH", `Product "${data.productName}" already has another sub-category`));
    }
    if (!dbProduct && !fileProductCodes.has(productId)) fileProductCodes.set(productId, data.subCategoryCode);

    const firstShadeRow = fileShades.get(shadeKey(data.brand, data.productName, data.shadeName))?.row;
    if (dbProduct && existingShades.has(`${dbProduct.id}|${key(data.shadeName)}`)) {
      errors.push(issue("shadeName", "DUPLICATE_SHADE", "This shade already exists in the product"));
    } else if (firstShadeRow !== undefined && firstShadeRow !== row) {
      errors.push(issue("shadeName", "DUPLICATE_SHADE", `Same shade as row ${firstShadeRow}`));
    }

    if (data.sku) {
      const firstSkuRow = fileSkus.get(data.sku);
      if (existingSkus.has(data.sku)) errors.push(issue("sku", "DUPLICATE_SKU", "SKU already exists"));
      else if (firstSkuRow !== undefined) errors.push(issue("sku", "DUPLICATE_SKU", `Same SKU as row ${firstSkuRow}`));
      if (firstSkuRow === undefined) fileSkus.set(data.sku, row);
    }

    errors.push(...checkComposition(data));
    const benchmark = checkBenchmark(data, fileShades, dbBenchmarkByKey);
    errors.push(...benchmark.errors);

    const config = subCategory && configByItemId.get(subCategory.id);
    const labels = config && classifyColor(data.hex, config);
    const computed = labels && {
      colorFamily: labels.colorFamily,
      undertone: labels.undertone,
      season: labels.season,
      valueClass: labels.valueClass,
      chromaClass: labels.chromaClass,
      isNewBrand: !dbBrand,
      isNewProduct: !dbProduct,
    };
    return { row, valid: errors.length === 0, errors, warnings: benchmark.warnings, computed };
  });

  const preview: DataInputPreviewResponse = {
    valid: result.every((row) => row.valid),
    rowCount: result.length,
    validCount: result.filter((row) => row.valid).length,
    newBrandCount: new Set(rows.filter((data) => !brandByKey.has(key(data.brand))).map((data) => key(data.brand))).size,
    newProductCount: new Set(rows.map((data) => productKey(data.brand, data.productName)).filter((id) => !productByKey.has(id))).size,
    rows: result,
  };
  return { preview, rows, brandByKey, productByKey, itemByCode, configByItemId, dbBenchmarkByKey };
}

/** Checks every row and returns every error at once. Reads only: nothing is saved. */
export async function previewDataInput(rawRows: unknown[]): Promise<DataInputPreviewResponse> {
  return (await analyze(rawRows)).preview;
}

/** Saves everything or nothing: it checks all rows again, then creates brands, products, shades and benchmarks in one transaction. */
export async function commitDataInput(rawRows: unknown[], user: AuthUser): Promise<DataInputCommitResponse> {
  const { preview, rows, brandByKey, productByKey, itemByCode, configByItemId, dbBenchmarkByKey } = await analyze(rawRows);
  if (!preview.valid) fail("BUSINESS_RULE", "Import contains invalid rows. Preview and correct all rows before committing.", "IMPORT_INVALID");
  const photoKeys = new Set(rows.flatMap((row) => [row.lipPhotoKey, row.swatchPhotoKey]).filter((value) => value !== undefined));
  await Promise.all([...photoKeys].map((photoKey) => verifyUpload(photoKey, "shade-photo")));

  // shortcut: two people creating the same new brand or product at once hit the unique index and one fails; retry then.
  return db.transaction(async (tx) => {
    const brandIds = new Map([...brandByKey].map(([id, brand]) => [id, brand.id]));
    const productIds = new Map([...productByKey].map(([id, product]) => [id, product.id]));
    const shadeIds = new Map<string, string>();
    let createdBrands = 0;
    let createdProducts = 0;

    for (const row of rows) {
      const subCategory = itemByCode.get(row.subCategoryCode);
      const config = subCategory && configByItemId.get(subCategory.id);
      if (!subCategory || !config) fail("BUSINESS_RULE", `Sub-category "${row.subCategoryCode}" has no active config`, "UNKNOWN_SUB_CATEGORY");

      let brandId = brandIds.get(key(row.brand));
      if (!brandId) {
        brandId = (await createBrand(tx, { name: row.brand, isOwn: row.origin === "own" })).id;
        brandIds.set(key(row.brand), brandId);
        createdBrands++;
      }
      let productId = productIds.get(productKey(row.brand, row.productName));
      if (!productId) {
        productId = (await createProduct(tx, { brandId, productFormatItemId: subCategory.id, name: row.productName })).id;
        productIds.set(productKey(row.brand, row.productName), productId);
        createdProducts++;
      }
      const shadeId = await createClassifiedShade(tx, {
        productId,
        name: row.shadeName,
        sku: row.sku,
        hex: row.hex,
        ingredientsInci: row.ingredientsInci,
        mayContain: row.mayContain,
        composition: row.composition,
        lipPhotoKey: row.lipPhotoKey,
        swatchPhotoKey: row.swatchPhotoKey,
        ...classifyColor(row.hex, config),
        createdBy: user.id,
      });
      shadeIds.set(shadeKey(row.brand, row.productName, row.shadeName), shadeId);
    }

    // Benchmarks last: a row may point to a shade that comes later in the file.
    const links = rows.flatMap((row) => {
      if (!row.benchmark) return [];
      const { brand, product, shade } = row.benchmark;
      const benchmarkShadeId = shadeIds.get(shadeKey(brand, product, shade)) ?? dbBenchmarkByKey.get(shadeKey(brand, product, shade))?.id;
      const shadeId = shadeIds.get(shadeKey(row.brand, row.productName, row.shadeName));
      return shadeId && benchmarkShadeId ? [{ shadeId, benchmarkShadeId }] : [];
    });
    await createBenchmarks(tx, links);
    return { imported: rows.length, createdBrands, createdProducts };
  });
}
