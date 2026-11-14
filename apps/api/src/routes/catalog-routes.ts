import { Hono } from "hono";
import * as catalog from "#api/controllers/catalog-controller.js";
import { type AppEnv, requirePermission } from "#api/middleware/auth.js";

const canWrite = requirePermission("catalog:write");

export const catalogRoutes = new Hono<AppEnv>().post("/imports/preview", canWrite, catalog.preview).post("/imports/commit", canWrite, catalog.commit);
