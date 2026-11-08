import { closeDb, createDb } from "../index.js";
import { seedCatalog } from "./catalog.js";
import { seedDevUsers } from "./dev-users.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const db = createDb(connectionString);

try {
  if (process.env.NODE_ENV === "development") {
    await seedDevUsers(db);
    await seedCatalog(db);
  } else {
    console.log("NODE_ENV is not development, development seed was skipped");
  }
} finally {
  await closeDb(db);
}
