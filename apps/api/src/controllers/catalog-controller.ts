import { importInput } from "@color-bank-hub/contracts/import";
import type { Context } from "hono";
import { parse } from "#api/core/errors.js";
import type { AppEnv } from "#api/middleware/auth.js";
import { commitImport, previewImport } from "#api/services/import-service.js";

type Ctx = Context<AppEnv>;

export async function preview(c: Ctx) {
  const { rows } = parse(importInput, await c.req.json());
  return c.json({ data: await previewImport(rows) });
}

export async function commit(c: Ctx) {
  const { rows } = parse(importInput, await c.req.json());
  return c.json({ data: await commitImport(rows) }, 201);
}
