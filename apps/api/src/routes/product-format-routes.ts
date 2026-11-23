import { Hono } from "hono";
import * as formats from "#api/controllers/product-format-controller.js";
import type { AppEnv } from "#api/middleware/auth.js";

export const productFormatRoutes = new Hono<AppEnv>().get("/product-formats", formats.listFormats);
