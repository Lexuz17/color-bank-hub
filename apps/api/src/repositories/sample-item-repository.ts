import type { SampleItem } from "#api/models/sample-item.js";

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

export const findAllSampleItems = async (): Promise<SampleItem[]> => {
  return sampleItems;
};
