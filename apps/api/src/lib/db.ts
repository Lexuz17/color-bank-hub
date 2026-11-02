import { createDb } from "@color-bank-hub/db";
import { env } from "#api/env.js";

export const db = createDb(env.databaseUrl);
