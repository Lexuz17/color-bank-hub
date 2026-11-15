import { and, asc, desc, eq, ilike, inArray, or, count, getTableColumns, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "#api/lib/db.js";
import { brands, products, productFormatItems, shadeBenchmarks, shades } from "@color-bank-hub/db";
import type { ShadeInput, ShadeQuery } from "@color-bank-hub/contracts/shade";
import { fail } from "#api/core/errors.js";
import { colorMetrics } from "@color-bank-hub/contracts/color";

type Executor = Parameters<Parameters<typeof db.transaction>[0]>[0];
// Composition is returned only on own-brand detail records, never on external products.
const view = {
  shade: getTableColumns(shades),
  product: getTableColumns(products),
  brand: getTableColumns(brands),
  formatItem: getTableColumns(productFormatItems),
};
export async function listShades(query: ShadeQuery) {
  const filters: (SQL | undefined)[] = [
    query.brandId ? eq(brands.id, query.brandId) : undefined,
    query.productId ? eq(products.id, query.productId) : undefined,
    query.productFormatItemId ? eq(products.productFormatItemId, query.productFormatItemId) : undefined,
    query.season ? eq(shades.season, query.season) : undefined,
    query.undertone ? eq(shades.undertone, query.undertone) : undefined,
    query.colorFamily ? eq(shades.colorFamily, query.colorFamily) : undefined,
    query.hueMunsell ? eq(shades.hueMunsell, query.hueMunsell) : undefined,
  ];
  if (query.search) {
    const pattern = `%${query.search.replace(/[\\%_]/g, "\\$&")}%`;
    filters.push(or(ilike(shades.name, pattern), ilike(shades.sku, pattern), ilike(products.name, pattern), ilike(brands.name, pattern)));
  }
  const where = and(...filters);
  const sortColumn = {
    name: shades.name,
    sku: shades.sku,
    createdAt: shades.createdAt,
    hue: shades.hslH,
    lightness: shades.hslL,
  }[query.sort];
  const order = query.direction === "asc" ? asc : desc;
  const [rows, totals] = await Promise.all([
    db
      .select(view)
      .from(shades)
      .innerJoin(products, eq(products.id, shades.productId))
      .innerJoin(brands, eq(brands.id, products.brandId))
      .innerJoin(productFormatItems, eq(productFormatItems.id, products.productFormatItemId))
      .where(where)
      .orderBy(order(sortColumn), asc(shades.id))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db
      .select({ count: count() })
      .from(shades)
      .innerJoin(products, eq(products.id, shades.productId))
      .innerJoin(brands, eq(brands.id, products.brandId))
      .where(where),
  ]);
  return {
    items: rows.map(({ shade, product, brand, formatItem }) => {
      const { composition: _composition, ...publicShade } = shade;
      return { ...publicShade, product, brand, formatItem };
    }),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total: totals[0].count,
    },
  };
}
export async function findShade(id: string) {
  const [row] = await db
    .select(view)
    .from(shades)
    .innerJoin(products, eq(products.id, shades.productId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .innerJoin(productFormatItems, eq(productFormatItems.id, products.productFormatItemId))
    .where(eq(shades.id, id));
  if (!row) fail("NOT_FOUND", "Shade not found", "SHADE_NOT_FOUND");
  const { composition, ...publicShade } = row.shade;
  const [benchmarkedTo, benchmarkFor] = await Promise.all([
    linkedShades(shadeBenchmarks.shadeId, shadeBenchmarks.benchmarkShadeId, id),
    linkedShades(shadeBenchmarks.benchmarkShadeId, shadeBenchmarks.shadeId, id),
  ]);
  return {
    ...publicShade,
    ...(row.brand.isOwn ? { composition } : {}),
    product: row.product,
    brand: row.brand,
    formatItem: row.formatItem,
    benchmarkedTo,
    benchmarkFor,
  };
}
function linkedShades(own: AnyPgColumn, other: AnyPgColumn, id: string) {
  return db
    .select({
      id: shades.id,
      name: shades.name,
      product: products.name,
      brand: brands.name,
    })
    .from(shadeBenchmarks)
    .innerJoin(shades, eq(shades.id, other))
    .innerJoin(products, eq(products.id, shades.productId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(eq(own, id))
    .orderBy(asc(brands.name), asc(shades.name));
}
async function insertShade(tx: Executor, input: ShadeInput) {
  const [product] = await tx
    .select({ isOwn: brands.isOwn })
    .from(products)
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(eq(products.id, input.productId));
  if (!product) fail("BUSINESS_RULE", "Product not found", "INVALID_PRODUCT");
  if (input.composition && !product.isOwn) fail("BUSINESS_RULE", "Composition is only allowed for own brands", "EXTERNAL_COMPOSITION");
  const [row] = await tx
    .insert(shades)
    .values({ ...input, ...colorMetrics(input.hex) })
    .returning();
  return row;
}
export async function createShades(rows: ShadeInput[]) {
  return db.transaction(async (tx) => {
    const result = [];
    for (const row of rows) result.push(await insertShade(tx, row));
    return result;
  });
}
export async function updateShade(id: string, input: Partial<Omit<ShadeInput, "productId">>) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(shades).where(eq(shades.id, id)).for("update");
    if (!existing) fail("NOT_FOUND", "Shade not found", "SHADE_NOT_FOUND");
    const [product] = await tx
      .select({ isOwn: brands.isOwn })
      .from(products)
      .innerJoin(brands, eq(brands.id, products.brandId))
      .where(eq(products.id, existing.productId));
    if (input.composition && !product.isOwn) fail("BUSINESS_RULE", "Composition is only allowed for own brands", "EXTERNAL_COMPOSITION");
    const [row] = await tx
      .update(shades)
      .set({
        ...input,
        ...(input.hex
          ? {
              ...colorMetrics(input.hex),
              undertone: null,
              season: null,
              hueMunsell: null,
              colorFamily: null,
              colorSub: null,
              valueClass: null,
              chromaClass: null,
              depthLevel: null,
            }
          : {}),
      })
      .where(eq(shades.id, id))
      .returning();
    const { composition, ...publicShade } = row;
    return { ...publicShade, ...(product.isOwn ? { composition } : {}) };
  });
}

export async function countInFormatItem(ids: string[], productFormatItemId: number) {
  const [row] = await db
    .select({ count: count() })
    .from(shades)
    .innerJoin(products, eq(products.id, shades.productId))
    .where(and(inArray(shades.id, ids), eq(products.productFormatItemId, productFormatItemId)));
  return row.count;
}

export type ShadeLabels = Pick<
  typeof shades.$inferInsert,
  "undertone" | "season" | "hueMunsell" | "colorFamily" | "colorSub" | "valueClass" | "chromaClass"
>;

export function listCategoryHexes(tx: Executor, productFormatId: number) {
  return tx
    .select({ id: shades.id, hex: shades.hex })
    .from(shades)
    .innerJoin(products, eq(products.id, shades.productId))
    .innerJoin(productFormatItems, eq(productFormatItems.id, products.productFormatItemId))
    .where(eq(productFormatItems.productFormatId, productFormatId));
}

export function updateLabels(tx: Executor, id: string, labels: ShadeLabels) {
  return tx.update(shades).set(labels).where(eq(shades.id, id));
}
