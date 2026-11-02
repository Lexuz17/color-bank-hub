import {
  brandInput,
  formatInput,
  productInput,
} from "@color-bank-hub/contracts/catalog";
import { uuid } from "@color-bank-hub/contracts/common";
import { importInput } from "@color-bank-hub/contracts/import";
import {
  shadeInput,
  shadePatch,
  shadeQuery,
} from "@color-bank-hub/contracts/shade";
import type { Context } from "hono";
import { parse } from "#api/core/errors.js";
import type { AppEnv } from "#api/middleware/auth.js";
import * as catalog from "#api/services/catalog-service.js";
import { commitImport, previewImport } from "#api/services/import-service.js";

type Ctx = Context<AppEnv>;

export async function listBrands(c: Ctx) {
  return c.json({ data: await catalog.listBrands() });
}

export async function createBrand(c: Ctx) {
  const input = parse(brandInput, await c.req.json());
  return c.json({ data: await catalog.createBrand(input) }, 201);
}

export async function listFormats(c: Ctx) {
  return c.json({ data: await catalog.listFormats() });
}

export async function createFormat(c: Ctx) {
  const input = parse(formatInput, await c.req.json());
  return c.json({ data: await catalog.createFormat(input) }, 201);
}

export async function listProducts(c: Ctx) {
  return c.json({ data: await catalog.listProducts() });
}

export async function createProduct(c: Ctx) {
  const input = parse(productInput, await c.req.json());
  return c.json({ data: await catalog.createProduct(input) }, 201);
}

export async function listShades(c: Ctx) {
  const query = parse(shadeQuery, c.req.query());
  return c.json({ data: await catalog.listShades(query) });
}

export async function findShade(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  return c.json({ data: await catalog.findShade(id, c.get("user").role) });
}

export async function createShade(c: Ctx) {
  const input = parse(shadeInput, await c.req.json());
  const shade = await catalog.createShade(input, c.get("user").role);
  return c.json({ data: shade }, 201);
}

export async function updateShade(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  const input = parse(shadePatch, await c.req.json());
  const shade = await catalog.updateShade(id, input, c.get("user").role);
  return c.json({ data: shade });
}

export async function preview(c: Ctx) {
  const { rows } = parse(importInput, await c.req.json());
  return c.json({ data: await previewImport(rows) });
}

export async function commit(c: Ctx) {
  const { rows } = parse(importInput, await c.req.json());
  return c.json({ data: await commitImport(rows) }, 201);
}
