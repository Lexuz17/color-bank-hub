import type { SampleItem } from "#api/domain/sample-item/sample-item.js";
import type { SampleItemRepository } from "#api/application/ports/sample-item-repository.js";

export class ListSampleItems {
  constructor(private readonly sampleItemRepository: SampleItemRepository) {}

  execute(): Promise<SampleItem[]> {
    return this.sampleItemRepository.findAll();
  }
}
