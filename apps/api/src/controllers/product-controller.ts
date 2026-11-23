// Products (brand + sub-category + name + INCI). Used by: Data Input product name suggestions, filters.
//
// Method Path           Handler       Permission  Input (contracts)                              DB
// GET    /api/products  listProducts  (auth)      productQuery: brandId?, productFormatItemId?,  read products
//                                                 search?
//
// Today GET has no filters and returns max 1000 rows; add productQuery when Data Input needs it.
// No create endpoint: products are created by POST /api/data-input/commit (find or create by brand + name).

import type { Context } from "hono";
import type { AppEnv } from "#api/middleware/auth.js";
import * as products from "#api/services/product-service.js";

type Ctx = Context<AppEnv>;

export async function listProducts(c: Ctx) {
  return c.json({ data: await products.listProducts() });
}
