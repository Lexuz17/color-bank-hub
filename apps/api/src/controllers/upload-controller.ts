import { uploadRequest } from "@color-bank-hub/contracts/upload";
import type { Context } from "hono";
import { parse } from "#api/core/errors.js";
import type { AppEnv } from "#api/middleware/auth.js";
import * as uploads from "#api/services/upload-service.js";

type Ctx = Context<AppEnv>;

export async function createUpload(c: Ctx) {
  const input = parse(uploadRequest, await c.req.json());
  const ticket = await uploads.createUpload(input, c.get("user").role);
  return c.json({ data: ticket }, 201);
}
