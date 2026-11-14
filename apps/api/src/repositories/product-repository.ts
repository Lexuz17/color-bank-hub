import { asc } from "drizzle-orm";
import { db } from "#api/lib/db.js";
import { products } from "@color-bank-hub/db";

export async function listProducts() {
  return db.select().from(products).orderBy(asc(products.name)).limit(1000);
}
export async function createProduct(input: typeof products.$inferInsert) {
  const [row] = await db.insert(products).values(input).returning();
  return row;
}
