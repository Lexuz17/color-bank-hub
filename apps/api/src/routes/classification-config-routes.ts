import { Hono } from "hono";
import * as configs from "#api/controllers/classification-config-controller.js";
import { type AppEnv, requirePermission } from "#api/middleware/auth.js";

export const classificationConfigRoutes = new Hono<AppEnv>()
  .get("/classification-configs", requirePermission("classification:manage"), configs.listVersions)
  .get("/classification-configs/active", configs.findActive)
  .post("/classification-configs", requirePermission("classification:manage"), configs.createVersion)
  .patch("/classification-configs/:id/activate", requirePermission("classification:manage"), configs.activate);
