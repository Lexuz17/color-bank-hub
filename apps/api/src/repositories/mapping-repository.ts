import { mappings, type NewMapping } from "@color-bank-hub/db";
import { db } from "#api/lib/db.js";

export async function createMapping(values: NewMapping) {
  const [row] = await db.insert(mappings).values(values).returning({ id: mappings.id, name: mappings.name, createdAt: mappings.createdAt });
  return row;
}
