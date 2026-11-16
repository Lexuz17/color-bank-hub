import { closeDb, createDb } from "../index.js";
import { seedCatalog } from "./catalog.js";
import { seedDevUsers } from "./dev-users.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const db = createDb(connectionString);

try {
  const development = process.env.NODE_ENV === "development";
  // Dev accounts (known password) only in development. The sample catalog can also fill a staging server: SEED_DEMO=true.
  if (development) await seedDevUsers(db);
  if (development || process.env.SEED_DEMO === "true") await seedCatalog(db);
  else console.log("NODE_ENV is not development and SEED_DEMO is not true, seed skipped");
} finally {
  await closeDb(db);
}
