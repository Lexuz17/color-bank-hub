import { Hono } from "hono";
import * as reports from "#api/controllers/report-controller.js";
import { type AppEnv, requirePermission } from "#api/middleware/auth.js";

export const reportRoutes = new Hono<AppEnv>()
  .get("/reports", reports.listReports)
  .post("/reports", requirePermission("report:create"), reports.createReport)
  .get("/reports/:id", reports.findReport)
  .patch("/reports/:id",requirePermission("report:resolve"),reports.updateReport);
