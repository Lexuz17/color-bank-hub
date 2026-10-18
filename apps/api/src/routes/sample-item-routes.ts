import { Hono } from "hono";
import { getSampleItemsController } from "#api/controllers/sample-item-controller.js";

const sampleItemRoutes = new Hono();

sampleItemRoutes.get("/", getSampleItemsController);

export { sampleItemRoutes };
