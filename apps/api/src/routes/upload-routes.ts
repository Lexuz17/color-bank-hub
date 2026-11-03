import { Hono } from "hono";
import * as uploads from "#api/controllers/upload-controller.js";
import type { AppEnv } from "#api/middleware/auth.js";

// Permission depends on the requested purpose, so the service checks it.
export const uploadRoutes = new Hono<AppEnv>().post(
  "/uploads",
  uploads.createUpload,
);
