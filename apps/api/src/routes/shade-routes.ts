import { Hono } from "hono";
import * as shades from "#api/controllers/shade-controller.js";
import { type AppEnv, requirePermission } from "#api/middleware/auth.js";

const canWrite = requirePermission("catalog:write");

export const shadeRoutes = new Hono<AppEnv>()
  .get("/shades", shades.listShades)
  .get("/shades/:id", shades.findShade)
  .patch("/shades/:id", canWrite, shades.updateShade);
