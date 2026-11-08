import { uuid } from "@color-bank-hub/contracts/common";
import { userPatch } from "@color-bank-hub/contracts/user";
import type { Context } from "hono";
import { parse } from "#api/core/errors.js";
import type { AppEnv } from "#api/middleware/auth.js";
import * as users from "#api/services/user-service.js";

type Ctx = Context<AppEnv>;

export async function listUsers(c: Ctx) {
  return c.json({ data: await users.listUsers() });
}

export async function updateUser(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  const input = parse(userPatch, await c.req.json());
  return c.json({ data: await users.updateUser(id, input, c.get("user").id) });
}
