// Brands. Used by: brand dropdowns and filters (Data Input, Color Database, Shade Mapping, Report), My Mappings "By brand".
//
// Method Path         Handler     Permission  Input  DB
// GET    /api/brands  listBrands  (auth)      -      read brands
//
// No create endpoint: brands are created by POST /api/data-input/commit (find or create by name).
// POST /api/brands exists today only for the old CatalogSetup UI; delete it (see data-input-controller.ts).

import { brandInput } from "@color-bank-hub/contracts/catalog";
import type { Context } from "hono";
import { parse } from "#api/core/errors.js";
import type { AppEnv } from "#api/middleware/auth.js";
import * as brands from "#api/services/brand-service.js";

type Ctx = Context<AppEnv>;

export async function listBrands(c: Ctx) {
  return c.json({ data: await brands.listBrands() });
}

export async function createBrand(c: Ctx) {
  const input = parse(brandInput, await c.req.json());
  return c.json({ data: await brands.createBrand(input) }, 201);
}
