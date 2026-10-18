import type { Context } from "hono";
import { getSampleItemsService } from "#api/services/sample-item-service.js";

export const getSampleItemsController = async (c: Context) => {
  const data = await getSampleItemsService();
  return c.json({ data });
};
