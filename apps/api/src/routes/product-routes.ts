import { Hono } from "hono";
import * as products from "#api/controllers/product-controller.js";
import type { AppEnv } from "#api/middleware/auth.js";

export const productRoutes = new Hono<AppEnv>().get("/products", products.listProducts);
