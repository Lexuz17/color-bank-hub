import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  or,
  count,
  getTableColumns,
  type SQL,
} from "drizzle-orm";
import {
  db,
  brands,
  products,
  productFormats,
  productFormatItems,
  shades,
} from "@color-bank-hub/db";
import type { ShadeInput, ShadeQuery } from "#api/models/catalog.js";
import { fail } from "#api/core/errors.js";
import { colorMetrics } from "#api/services/color-service.js";

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
    query.formatItemId
      ? eq(products.formatItemId, query.formatItemId)
      : undefined,
    query.season ? eq(shades.season, query.season) : undefined,
    query.undertone ? eq(shades.undertone, query.undertone) : undefined,
    query.colorFamily ? eq(shades.colorFamily, query.colorFamily) : undefined,
  ];
  if (query.search) {
    const pattern = `%${query.search.replace(/[\\%_]/g, "\\$&")}%`;
    filters.push(
      or(
        ilike(shades.name, pattern),
        ilike(shades.sku, pattern),
        ilike(products.name, pattern),
        ilike(brands.name, pattern),
      ),
    );
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
      .innerJoin(
        productFormatItems,
        eq(productFormatItems.id, products.formatItemId),
      )
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
    .innerJoin(
      productFormatItems,
      eq(productFormatItems.id, products.formatItemId),
    )
    .where(eq(shades.id, id));
  if (!row) fail(404, "SHADE_NOT_FOUND", "Shade not found");
  const { composition, ...publicShade } = row.shade;
  return {
    ...publicShade,
    ...(row.brand.isOwn ? { composition } : {}),
    product: row.product,
    brand: row.brand,
    formatItem: row.formatItem,
  };
}
export async function listBrands() {
  return db.select().from(brands).orderBy(asc(brands.name));
}
export async function listFormats() {
  const [formats, counts] = await Promise.all([
    db.query.productFormats.findMany({
      orderBy: [asc(productFormats.sortOrder), asc(productFormats.id)],
      with: {
        items: {
          orderBy: [
            asc(productFormatItems.sortOrder),
            asc(productFormatItems.id),
          ],
        },
      },
    }),
    db
      .select({ id: products.formatItemId, count: count() })
      .from(shades)
      .innerJoin(products, eq(products.id, shades.productId))
      .groupBy(products.formatItemId),
  ]);
  const totals = new Map(counts.map((row) => [row.id, row.count]));
  return formats.map((format) => ({
    ...format,
    count: format.items.reduce(
      (sum, item) => sum + (totals.get(item.id) ?? 0),
      0,
    ),
    items: format.items.map((item) => ({
      ...item,
      count: totals.get(item.id) ?? 0,
    })),
  }));
}
export async function createFormat(input: {
  name: string;
  items: { name: string; code: string }[];
}) {
  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(productFormats)
      .values({ name: input.name })
      .onConflictDoNothing({ target: productFormats.name })
      .returning();
    const format =
      created ??
      (
        await tx
          .select()
          .from(productFormats)
          .where(eq(productFormats.name, input.name))
      )[0];
    const items = await tx
      .insert(productFormatItems)
      .values(input.items.map((item) => ({ ...item, formatId: format.id })))
      .returning();
    return {
      ...format,
      count: 0,
      items: items.map((item) => ({ ...item, count: 0 })),
    };
  });
}
export async function listProducts() {
  return db.select().from(products).orderBy(asc(products.name)).limit(1000);
}
export async function createBrand(input: typeof brands.$inferInsert) {
  const [row] = await db.insert(brands).values(input).returning();
  return row;
}
export async function createProduct(input: typeof products.$inferInsert) {
  const [row] = await db.insert(products).values(input).returning();
  return row;
}
export async function validateShadeRows(rows: ShadeInput[]) {
  const ids = [...new Set(rows.map((row) => row.productId))];
  const existingProducts = ids.length
    ? await db
        .select({ id: products.id, isOwn: brands.isOwn })
        .from(products)
        .innerJoin(brands, eq(brands.id, products.brandId))
        .where(inArray(products.id, ids))
    : [];
  const skus = rows.map((row) => row.sku);
  const existingSkus = skus.length
    ? await db
        .select({ sku: shades.sku })
        .from(shades)
        .where(inArray(shades.sku, skus))
    : [];
  const productMap = new Map(existingProducts.map((row) => [row.id, row]));
  const duplicates = new Set(existingSkus.map((row) => row.sku));
  return rows.map((row) =>
    !productMap.has(row.productId)
      ? "Product not found"
      : row.composition && !productMap.get(row.productId)?.isOwn
        ? "Composition is only allowed for own brands"
        : duplicates.has(row.sku)
          ? "SKU already exists"
          : null,
  );
}
async function insertShade(tx: Executor, input: ShadeInput) {
  const [product] = await tx
    .select({ isOwn: brands.isOwn })
    .from(products)
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(eq(products.id, input.productId));
  if (!product) fail(422, "INVALID_PRODUCT", "Product not found");
  if (input.composition && !product.isOwn)
    fail(
      422,
      "EXTERNAL_COMPOSITION",
      "Composition is only allowed for own brands",
    );
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
export async function updateShade(
  id: string,
  input: Partial<Omit<ShadeInput, "productId">>,
) {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(shades)
      .where(eq(shades.id, id))
      .for("update");
    if (!existing) fail(404, "SHADE_NOT_FOUND", "Shade not found");
    const [product] = await tx
      .select({ isOwn: brands.isOwn })
      .from(products)
      .innerJoin(brands, eq(brands.id, products.brandId))
      .where(eq(products.id, existing.productId));
    if (input.composition && !product.isOwn)
      fail(
        422,
        "EXTERNAL_COMPOSITION",
        "Composition is only allowed for own brands",
      );
    const [row] = await tx
      .update(shades)
      .set({
        ...input,
        ...(input.hex
          ? {
              ...colorMetrics(input.hex),
              undertone: null,
              season: null,
              colorFamily: null,
              colorSub: null,
              valueClass: null,
              chromaClass: null,
              depthLevel: null,
              classificationConfigId: null,
            }
          : {}),
      })
      .where(eq(shades.id, id))
      .returning();
    const { composition, ...publicShade } = row;
    return { ...publicShade, ...(product.isOwn ? { composition } : {}) };
  });
}
