import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema/index.js";

if (!process.env.DATABASE_URL && typeof process.loadEnvFile === "function") {
  const rootEnv = path.resolve(import.meta.dirname, "../../../.env");
  if (fs.existsSync(rootEnv)) {
    process.loadEnvFile(rootEnv);
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(connectionString);

export const db = drizzle(client, { schema });

export const closeDatabase = () => client.end({ timeout: 5 });

export { schema };
export * from "./schema/index.js";
