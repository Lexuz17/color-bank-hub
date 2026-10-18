import type { Context } from "hono";
import type { ListSampleItems } from "#api/application/use-cases/list-sample-items.js";

export const createListSampleItemsController = (
  listSampleItems: ListSampleItems,
) => {
  return async (context: Context) =>
    context.json({ data: await listSampleItems.execute() });
};
