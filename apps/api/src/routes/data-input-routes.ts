import { Hono } from "hono";
import * as dataInput from "#api/controllers/data-input-controller.js";
import { type AppEnv, requirePermission } from "#api/middleware/auth.js";

const canWrite = requirePermission("catalog:write");

export const dataInputRoutes = new Hono<AppEnv>()
  .post("/data-input/preview", canWrite, dataInput.preview)
  .post("/data-input/commit", canWrite, dataInput.commit);
