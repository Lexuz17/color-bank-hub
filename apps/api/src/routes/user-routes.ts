import { Hono } from "hono";
import * as users from "#api/controllers/user-controller.js";
import { type AppEnv, requirePermission } from "#api/middleware/auth.js";

export const userRoutes = new Hono<AppEnv>().get(
  "/users",
  requirePermission("user:manage"),
  users.listUsers,
);
