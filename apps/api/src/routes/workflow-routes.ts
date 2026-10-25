import { Hono } from "hono";
import * as workflow from "#api/controllers/workflow-controller.js";
export const reportRoutes = new Hono()
  .get("/", workflow.listReports)
  .post("/", workflow.createReport)
  .get("/:id", workflow.findReport)
  .patch("/:id", workflow.updateReport);
export const prototypeRoutes = new Hono()
  .get("/", workflow.listRequests)
  .post("/", workflow.createRequest)
  .get("/:id", workflow.findRequest)
  .patch("/:id/status", workflow.transition)
  .patch("/:id/formulation", workflow.formulation);
