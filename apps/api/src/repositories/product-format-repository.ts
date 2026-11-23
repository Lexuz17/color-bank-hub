import { asc, count, eq, inArray } from "drizzle-orm";
import { db } from "#api/lib/db.js";
import { products, productFormats, productFormatItems, shades } from "@color-bank-hub/db";

export async function listFormats() {
  const [formats, counts] = await Promise.all([
    db.query.productFormats.findMany({
      orderBy: [asc(productFormats.sortOrder), asc(productFormats.id)],
      with: {
        items: {
          orderBy: [asc(productFormatItems.sortOrder), asc(productFormatItems.id)],
        },
      },
    }),
    db
      .select({ id: products.productFormatItemId, count: count() })
      .from(shades)
      .innerJoin(products, eq(products.id, shades.productId))
      .groupBy(products.productFormatItemId),
  ]);
  const totals = new Map(counts.map((row) => [row.id, row.count]));
  return formats.map((format) => ({
    ...format,
    count: format.items.reduce((sum, item) => sum + (totals.get(item.id) ?? 0), 0),
    items: format.items.map((item) => ({
      ...item,
      count: totals.get(item.id) ?? 0,
    })),
  }));
}
export async function listFormatItemsByCodes(codes: string[]) {
  if (!codes.length) return [];
  return db
    .select({ id: productFormatItems.id, code: productFormatItems.code })
    .from(productFormatItems)
    .where(inArray(productFormatItems.code, codes));
}
