import type { Context } from "hono";
import { parse } from "#api/core/errors.js";
import { importInput } from "#api/models/catalog.js";
import * as catalog from "#api/services/catalog-service.js";
import { previewImport, commitImport } from "#api/services/import-service.js";
export const listShades = async (c: Context) =>
  c.json({ data: await catalog.listShades(c.req.query()) });
export const findShade = async (c: Context) =>
  c.json({ data: await catalog.findShade(c.req.param("id")) });
export const listBrands = async (c: Context) =>
  c.json({ data: await catalog.listBrands() });
export const listFormats = async (c: Context) =>
  c.json({ data: await catalog.listFormats() });
export const listProducts = async (c: Context) =>
  c.json({ data: await catalog.listProducts() });
export const createBrand = async (c: Context) =>
  c.json({ data: await catalog.createBrand(await c.req.json()) }, 201);
export const createProduct = async (c: Context) =>
  c.json({ data: await catalog.createProduct(await c.req.json()) }, 201);
export const createShade = async (c: Context) =>
  c.json({ data: await catalog.createShade(await c.req.json()) }, 201);
export const updateShade = async (c: Context) =>
  c.json({
    data: await catalog.updateShade(c.req.param("id"), await c.req.json()),
  });
export const preview = async (c: Context) => {
  const input = parse(importInput, await c.req.json());
  return c.json({ data: await previewImport(input.rows) });
};
export const commit = async (c: Context) => {
  const input = parse(importInput, await c.req.json());
  return c.json({ data: await commitImport(input.rows) }, 201);
};

export const createFormat = async (c: Context) =>
  c.json({ data: await catalog.createFormat(await c.req.json()) }, 201);
