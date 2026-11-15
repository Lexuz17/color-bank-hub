import { createDb } from "@color-bank-hub/db";
import { env } from "#api/env.js";

export const db = createDb(env.databaseUrl);

// A transaction handle
export type Executor = Parameters<Parameters<typeof db.transaction>[0]>[0];
