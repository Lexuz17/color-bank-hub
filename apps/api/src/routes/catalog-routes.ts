import { Hono } from "hono";
import * as catalog from "#api/controllers/catalog-controller.js";
import { type AppEnv, requirePermission } from "#api/middleware/auth.js";

const canWrite = requirePermission("catalog:write");

export const catalogRoutes = new Hono<AppEnv>()
  .get("/brands", catalog.listBrands)
  .post("/brands", canWrite, catalog.createBrand)
  .get("/product-formats", catalog.listFormats)
  .post("/product-formats", canWrite, catalog.createFormat)
  .get("/products", catalog.listProducts)
  .post("/products", canWrite, catalog.createProduct)
  .get("/shades", catalog.listShades)
  .post("/shades", canWrite, catalog.createShade)
  .get("/shades/:id", catalog.findShade)
  .patch("/shades/:id", canWrite, catalog.updateShade)
  .post("/imports/preview", canWrite, catalog.preview)
  .post("/imports/commit", canWrite, catalog.commit);
