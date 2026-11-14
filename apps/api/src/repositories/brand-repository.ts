import { asc } from "drizzle-orm";
import { db } from "#api/lib/db.js";
import { brands } from "@color-bank-hub/db";

export async function listBrands() {
  return db.select().from(brands).orderBy(asc(brands.name));
}
export async function createBrand(input: typeof brands.$inferInsert) {
  const [row] = await db.insert(brands).values(input).returning();
  return row;
}
