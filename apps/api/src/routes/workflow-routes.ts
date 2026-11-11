import { Hono } from "hono";
import * as workflow from "#api/controllers/workflow-controller.js";
import { type AppEnv, requirePermission } from "#api/middleware/auth.js";

const canProcess = requirePermission("prototype:process");

export const workflowRoutes = new Hono<AppEnv>()
  .get("/prototype-requests", workflow.listRequests)
  .post(
    "/prototype-requests",
    requirePermission("prototype:create"),
    workflow.createRequest,
  )
  .get("/prototype-requests/:id", workflow.findRequest)
  .patch("/prototype-requests/:id/status", canProcess, workflow.transition)
  .patch(
    "/prototype-requests/:id/formulation",
    canProcess,
    workflow.updateFormulation,
  );
