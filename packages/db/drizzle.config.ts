import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs from packages/db; the env file lives at the monorepo root.
config({ path: "../../.env", quiet: true });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
