// Brands. Used by: brand dropdowns and filters (Data Input, Color Database, Shade Mapping, Report), My Mappings "By brand".
//
// Method Path         Handler     Permission  Input  DB
// GET    /api/brands  listBrands  (auth)      -      read brands
//
// No create endpoint: brands are created by POST /api/data-input/commit (find or create by name).

import type { Context } from "hono";
import type { AppEnv } from "#api/middleware/auth.js";
import * as brands from "#api/services/brand-service.js";

type Ctx = Context<AppEnv>;

export async function listBrands(c: Ctx) {
  return c.json({ data: await brands.listBrands() });
}
