import type { Context } from "hono";
import type { AppEnv } from "#api/middleware/auth.js";
import * as users from "#api/services/user-service.js";

type Ctx = Context<AppEnv>;

export async function listUsers(c: Ctx) {
  return c.json({ data: await users.listUsers() });
}
