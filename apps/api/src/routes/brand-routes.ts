import { Hono } from "hono";
import * as brands from "#api/controllers/brand-controller.js";
import { type AppEnv, requirePermission } from "#api/middleware/auth.js";

export const brandRoutes = new Hono<AppEnv>()
  .get("/brands", brands.listBrands)
  .post("/brands", requirePermission("catalog:write"), brands.createBrand);
