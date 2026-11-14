import { asc, count, eq } from "drizzle-orm";
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
export async function createFormat(input: { name: string; items: { name: string; code: string }[] }) {
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(productFormats).values({ name: input.name }).onConflictDoNothing({ target: productFormats.name }).returning();
    const format = created ?? (await tx.select().from(productFormats).where(eq(productFormats.name, input.name)))[0];
    const items = await tx
      .insert(productFormatItems)
      .values(input.items.map((item) => ({ ...item, productFormatId: format.id })))
      .returning();
    return {
      ...format,
      count: 0,
      items: items.map((item) => ({ ...item, count: 0 })),
    };
  });
}
