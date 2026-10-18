import { Hono } from "hono";
import { ListSampleItems } from "#api/application/use-cases/list-sample-items.js";
import { InMemorySampleItemRepository } from "#api/infrastructure/repositories/in-memory-sample-item-repository.js";
import { createListSampleItemsController } from "#api/presentation/http/controllers/list-sample-items-controller.js";

const sampleItemRoutes = new Hono();
const listSampleItems = new ListSampleItems(new InMemorySampleItemRepository());

sampleItemRoutes.get("/", createListSampleItemsController(listSampleItems));

export { sampleItemRoutes };
