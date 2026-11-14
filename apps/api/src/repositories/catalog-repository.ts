import { eq, inArray } from "drizzle-orm";
import { db } from "#api/lib/db.js";
import { brands, products, shades } from "@color-bank-hub/db";
import type { ShadeInput } from "@color-bank-hub/contracts/shade";

export async function validateShadeRows(rows: ShadeInput[]) {
  const ids = [...new Set(rows.map((row) => row.productId))];
  const existingProducts = ids.length
    ? await db
        .select({ id: products.id, isOwn: brands.isOwn })
        .from(products)
        .innerJoin(brands, eq(brands.id, products.brandId))
        .where(inArray(products.id, ids))
    : [];
  const skus = rows.flatMap((row) => (row.sku ? [row.sku] : []));
  const existingSkus = skus.length ? await db.select({ sku: shades.sku }).from(shades).where(inArray(shades.sku, skus)) : [];
  const productMap = new Map(existingProducts.map((row) => [row.id, row]));
  const duplicates = new Set(existingSkus.map((row) => row.sku));
  return rows.map((row) =>
    !productMap.has(row.productId)
      ? "Product not found"
      : row.composition && !productMap.get(row.productId)?.isOwn
        ? "Composition is only allowed for own brands"
        : row.sku && duplicates.has(row.sku)
          ? "SKU already exists"
          : null,
  );
}
