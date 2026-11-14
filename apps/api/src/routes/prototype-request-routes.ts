import { Hono } from "hono";
import * as requests from "#api/controllers/prototype-request-controller.js";
import { type AppEnv, requirePermission } from "#api/middleware/auth.js";

const canProcess = requirePermission("prototype:process");

export const prototypeRequestRoutes = new Hono<AppEnv>()
  .get("/prototype-requests", requests.listRequests)
  .post("/prototype-requests", requirePermission("prototype:create"), requests.createRequest)
  .get("/prototype-requests/:id", requests.findRequest)
  .patch("/prototype-requests/:id/status", canProcess, requests.transition)
  .patch("/prototype-requests/:id/formulation", canProcess, requests.updateFormulation);
