import { Hono } from "hono";
import * as mappings from "#api/controllers/mapping-controller.js";
import type { AppEnv } from "#api/middleware/auth.js";

export const mappingRoutes = new Hono<AppEnv>().post("/mappings", mappings.createMapping);
