import type { SampleItemRepository } from "#api/application/ports/sample-item-repository.js";
import type { SampleItem } from "#api/domain/sample-item/sample-item.js";

const sampleItems: SampleItem[] = [
  {
    id: "sample-1",
    title: "First sample",
    description: "A placeholder record for API integration.",
    createdAt: new Date("2026-01-01"),
  },
  {
    id: "sample-2",
    title: "Second sample",
    description: "Replace this repository when real data is ready.",
    createdAt: new Date("2026-01-01"),
  },
];

export class InMemorySampleItemRepository implements SampleItemRepository {
  async findAll(): Promise<SampleItem[]> {
    return sampleItems;
  }
}
