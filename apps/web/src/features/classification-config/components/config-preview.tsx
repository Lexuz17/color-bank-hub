import { type ClassificationConfig, classifyColor } from "@color-bank-hub/contracts/color-classification";
import { useState } from "react";
import { useShades } from "@/api/shades/shade-queries";
import { type MapView, ShadeMap } from "@/components/shared/shade-map";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const labels = ["season", "undertone", "colorFamily", "colorSub", "valueClass", "chromaClass", "hueMunsell"] as const;
const LIMIT = 100;

interface Props {
  items: { id: number; name: string }[];
  view: MapView;
  /** Cut-offs being edited, not saved yet. */
  draft: ClassificationConfig;
  /** Cut-offs in use now, to count what the draft would change. */
  active: ClassificationConfig;
  /** The draft differs from the active cut-offs. */
  dirty: boolean;
}

export function ConfigPreview({ items, view, draft, active, dirty }: Props) {
  const [itemId, setItemId] = useState(items[0]?.id ?? null);
  const shades = useShades({ productFormatItemId: itemId ?? undefined, pageSize: LIMIT }, itemId !== null);
  const list = shades.data?.items ?? [];
  const changed = list.filter((shade) => {
    const before = classifyColor(shade.hex, active);
    const after = classifyColor(shade.hex, draft);
    return labels.some((label) => before[label] !== after[label]);
  }).length;

  return (
    <section className="rounded-md border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
        <div>
          <h3 className="text-sm font-medium">Preview</h3>
          {dirty && (
            <p className="text-[11px] text-warning-foreground">
              Unsaved changes: {changed} of {list.length} shades shown here get a different label.
            </p>
          )}
        </div>
        <Select value={itemId === null ? null : String(itemId)} onValueChange={(value) => value && setItemId(Number(value))}>
          <SelectTrigger size="sm" className="w-44" aria-label="Sub-category to preview">
            <SelectValue>{() => items.find((item) => item.id === itemId)?.name ?? "Sub-category"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>
      <div className="h-140">
        <ShadeMap
          shades={list}
          view={view}
          axisX="lchC"
          axisY="hslL"
          config={draft}
          showPhoto={false}
          showScale
          hideProductName
          compact
          activeId={null}
          onOpen={() => {}}
        />
      </div>
    </section>
  );
}
