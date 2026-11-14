import { Hono } from "hono";
import * as products from "#api/controllers/product-controller.js";
import { type AppEnv, requirePermission } from "#api/middleware/auth.js";

export const productRoutes = new Hono<AppEnv>()
  .get("/products", products.listProducts)
  .post("/products", requirePermission("catalog:write"), products.createProduct);
