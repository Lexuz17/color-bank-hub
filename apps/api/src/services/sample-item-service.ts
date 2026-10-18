import type { SampleItem } from "#api/models/sample-item.js";
import { findAllSampleItems } from "#api/repositories/sample-item-repository.js";

export const getSampleItemsService = async (): Promise<SampleItem[]> => {
  return findAllSampleItems();
};
