import { Hono } from "hono";
import * as dataInput from "#api/controllers/data-input-controller.js";
import { type AppEnv, requirePermission } from "#api/middleware/auth.js";

const canWrite = requirePermission("catalog:write");

// Paths stay /imports/* until the web moves to /data-input/* (see the controller header).
export const dataInputRoutes = new Hono<AppEnv>()
  .post("/imports/preview", canWrite, dataInput.preview)
  .post("/imports/commit", canWrite, dataInput.commit);
