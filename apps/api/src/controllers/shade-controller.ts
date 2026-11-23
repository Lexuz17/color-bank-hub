// Shades. Used by: Color Database table, Shade Mapping (select SKUs + map + detail panel), Data Input manual entry / manage.
// Shades are created by Data Input (data-input-controller); this module only reads and edits them.
//
// Method Path               Handler      Permission     Input (contracts)   DB
// GET    /api/shades        listShades   (auth)         shade.shadeQuery    read  shades + products + brands + product_format_items
// GET    /api/shades/:id    findShade    (auth)         uuid                read  same + shade_benchmarks (both directions)
// PATCH  /api/shades/:id    updateShade  catalog:write  shade.shadePatch    write shades, shade_benchmarks
//        Used by Data Input > Manage Database (edit row). Body may include benchmarkShadeIds: uuid[] = the full list;
//        the service replaces this shade's shade_benchmarks rows in the same transaction.
//
// To add:
// - Classify on edit: PATCH recomputes colorMetrics() only; labels are not recomputed when the HEX changes.
// - shadeQuery filters for Shade Mapping / Color Database: hueMunsell, valueClass, chromaClass, benchmarked (row exists in shade_benchmarks).
// - List rows: "Benchmark for" / "Benchmarked to" names for the Color Database columns.
// - GET /api/shades/:id/similar (similar shades carousel). Formula still open in the brief; do not build yet.
// Benchmark rules (benchmarkShadeIds): this shade is own and each benchmark external -> BUSINESS_RULE BENCHMARK_DIRECTION;
//   same sub-category or an allowed pair (docs/brief/README.md) -> BUSINESS_RULE BENCHMARK_FORMAT_NOT_ALLOWED;
//   every id exists -> BUSINESS_RULE BENCHMARK_NOT_FOUND.
// Rules (service): composition is read with shade:viewComposition, photo keys via verifyUpload("shade-photo"),
// return signed URLs via getFileUrl().

import { uuid } from "@color-bank-hub/contracts/common";
import { shadePatch, shadeQuery } from "@color-bank-hub/contracts/shade";
import type { Context } from "hono";
import { parse } from "#api/core/errors.js";
import type { AppEnv } from "#api/middleware/auth.js";
import * as shades from "#api/services/shade-service.js";

type Ctx = Context<AppEnv>;

export async function listShades(c: Ctx) {
  const query = parse(shadeQuery, c.req.query());
  return c.json({ data: await shades.listShades(query) });
}

export async function findShade(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  return c.json({ data: await shades.findShade(id, c.get("user").role) });
}

export async function updateShade(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  const input = parse(shadePatch, await c.req.json());
  const shade = await shades.updateShade(id, input, c.get("user").role);
  return c.json({ data: shade });
}
