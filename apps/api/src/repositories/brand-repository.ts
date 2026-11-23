import { asc, inArray, sql } from "drizzle-orm";
import { db, type Executor } from "#api/lib/db.js";
import { brands } from "@color-bank-hub/db";

export async function listBrands() {
  return db.select().from(brands).orderBy(asc(brands.name));
}
export async function createBrand(tx: Executor, input: typeof brands.$inferInsert) {
  const [row] = await tx.insert(brands).values(input).returning();
  return row;
}

export async function findBrandsByNames(names: string[]) {
  if (!names.length) return [];
  return db
    .select({ id: brands.id, name: brands.name, isOwn: brands.isOwn })
    .from(brands)
    .where(
      inArray(
        sql`lower(${brands.name})`,
        names.map((value) => value.toLowerCase()),
      ),
    );
}
