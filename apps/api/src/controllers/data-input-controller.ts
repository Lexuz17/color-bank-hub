// Data Input: add shades from the .xlsx template (File Upload) or one at a time (Manual Entry).
//
// Method Path                     Handler  Permission     DB
// POST   /api/data-input/preview  preview  catalog:write  read only
// POST   /api/data-input/commit   commit   catalog:write  write brands, products, shades, shade_benchmarks (one transaction)

// Both take rows of names, not ids (max 500). Manual Entry sends one row.
// Preview checks every row and returns all errors and warnings at once, plus the computed labels.
// Commit checks again and saves everything or nothing (IMPORT_INVALID if any row fails). The web uploads the photos
// ("shade-photo") first and sends their keys as lipPhotoKey / swatchPhotoKey.

// Rules (services/data-input-service.ts):
// - A brand or product that does not exist yet (matched by name, ignoring case) is created; origin own|external sets isOwn.
// - The sub-category code picks the category; its active classification config labels the shade.
// - Errors: UNKNOWN_SUB_CATEGORY, BRAND_ORIGIN_MISMATCH, PRODUCT_FORMAT_MISMATCH, DUPLICATE_SHADE, DUPLICATE_SKU,
//   COMPOSITION_OVER_100, BENCHMARK_NOT_FOUND. Warning only: BENCHMARK_FORMAT_NOT_ALLOWED.

import { commitDataInputRequest, previewDataInputRequest } from "@color-bank-hub/contracts/data-input";
import type { Context } from "hono";
import { parse } from "#api/core/errors.js";
import type { AppEnv } from "#api/middleware/auth.js";
import { commitDataInput, previewDataInput } from "#api/services/data-input-service.js";

type Ctx = Context<AppEnv>;

export async function preview(c: Ctx) {
  const { rows } = parse(previewDataInputRequest, await c.req.json());
  return c.json({ data: await previewDataInput(rows) });
}

export async function commit(c: Ctx) {
  const { rows } = parse(commitDataInputRequest, await c.req.json());
  return c.json({ data: await commitDataInput(rows, c.get("user")) }, 201);
}
