import type { SampleItem } from "#api/domain/sample-item/sample-item.js";

export interface SampleItemRepository {
  findAll(): Promise<SampleItem[]>;
}
