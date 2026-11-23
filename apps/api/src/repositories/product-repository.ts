import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db, type Executor } from "#api/lib/db.js";
import { products } from "@color-bank-hub/db";

export async function listProducts() {
  return db.select().from(products).orderBy(asc(products.name)).limit(1000);
}

export async function findProduct(id: string) {
  const [row] = await db.select().from(products).where(eq(products.id, id));
  return row;
}

export async function createProduct(tx: Executor, input: typeof products.$inferInsert) {
  const [row] = await tx.insert(products).values(input).returning();
  return row;
}

export async function findProductsByNames(brandIds: string[], names: string[]) {
  if (!brandIds.length) return [];
  return db
    .select({ id: products.id, brandId: products.brandId, name: products.name, productFormatItemId: products.productFormatItemId })
    .from(products)
    .where(
      and(
        inArray(products.brandId, brandIds),
        inArray(
          sql`lower(${products.name})`,
          names.map((value) => value.toLowerCase()),
        ),
      ),
    );
}
