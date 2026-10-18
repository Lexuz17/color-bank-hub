import type { SampleItem } from "@/types/sample-item";

interface SampleItemListProps {
  sampleItems: SampleItem[];
}

export function SampleItemList({ sampleItems }: SampleItemListProps) {
  return (
    <ul className="mt-8 grid gap-3">
      {sampleItems.map((sampleItem) => (
        <li
          key={sampleItem.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <strong className="block text-slate-900">{sampleItem.title}</strong>
          <span className="mt-1 block text-slate-600">
            {sampleItem.description}
          </span>
        </li>
      ))}
    </ul>
  );
}
