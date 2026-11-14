import { Hono } from "hono";
import type { AppEnv } from "#api/middleware/auth.js";
import { brandRoutes } from "#api/routes/brand-routes.js";
import { dataInputRoutes } from "#api/routes/data-input-routes.js";
import { productFormatRoutes } from "#api/routes/product-format-routes.js";
import { productRoutes } from "#api/routes/product-routes.js";
import { prototypeRequestRoutes } from "#api/routes/prototype-request-routes.js";
import { reportRoutes } from "#api/routes/report-routes.js";
import { shadeRoutes } from "#api/routes/shade-routes.js";
import { uploadRoutes } from "#api/routes/upload-routes.js";
import { userRoutes } from "#api/routes/user-routes.js";

export const routes = new Hono<AppEnv>()
  .route("/", brandRoutes)
  .route("/", productFormatRoutes)
  .route("/", productRoutes)
  .route("/", shadeRoutes)
  .route("/", dataInputRoutes)
  .route("/", reportRoutes)
  .route("/", prototypeRequestRoutes)
  .route("/", uploadRoutes)
  .route("/", userRoutes);
