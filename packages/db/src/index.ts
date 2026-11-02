import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema/index.js";

export function createDb(connectionString: string) {
  return drizzle(postgres(connectionString), { schema });
}

export type Database = ReturnType<typeof createDb>;

export const closeDb = (db: Database) => db.$client.end({ timeout: 5 });

export { schema };
export * from "./schema/index.js";
