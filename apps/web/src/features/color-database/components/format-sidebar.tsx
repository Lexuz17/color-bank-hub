import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { useProductFormats } from "@/api/product-formats/product-format-queries";
import { ApiError } from "@/components/shared/request-feedback";
import { LoadingState } from "@/components/shared/workspace-components";
import { SelectionSummary } from "./selection-summary";

interface Props {
  itemIds: number[];
  onChange: (itemIds: number[]) => void;
  selectionCount: number;
  selectionLabel: string;
  onClear: () => void;
  onMap: () => void;
}

const formatGroups = [
  { title: "LIP PRODUCT FORMATS", formats: ["Lip Cream", "Lip Tint", "Lip Stick", "Lip Oil"] },
  { title: "BLUSH FORMATS", formats: ["Blush"] },
  { title: "EYESHADOW FORMATS", formats: ["Eyeshadow"] },
];

function Row({
  label,
  count,
  state,
  indent,
  tag,
  onClick,
}: {
  label: string;
  count: number;
  state: "none" | "some" | "all";
  indent?: boolean;
  tag?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={state === "all"}
      onClick={onClick}
      className={`flex w-full items-center gap-2 border-l-2 py-2 pr-3 text-left hover:bg-muted ${indent ? "pl-8" : "pl-4 font-medium"} ${
        state === "none" ? "border-transparent" : "border-primary bg-accent text-primary"
      }`}
    >
      {state === "all" ? (
        <Check className="size-3 shrink-0" />
      ) : state === "some" ? (
        <Minus className="size-3 shrink-0" />
      ) : (
        <span className="mx-1 size-1 shrink-0 rounded-full bg-chart-2" />
      )}
      <span className="truncate">{label}</span>
      {tag}
      <span className="ml-auto rounded-full bg-muted px-1.5 text-[10px] font-normal text-muted-foreground">{count}</span>
    </button>
  );
}

export function FormatSidebar({ itemIds, onChange, selectionCount, selectionLabel, onClear, onMap }: Props) {
  const formats = useProductFormats();
  const known = formatGroups.flatMap((group) => group.formats);
  const groups = [
    ...formatGroups.map((group) => ({ title: group.title, formats: formats.data?.filter((format) => group.formats.includes(format.name)) ?? [] })),
    { title: "OTHER FORMATS", formats: formats.data?.filter((format) => !known.includes(format.name)) ?? [] },
  ].filter((group) => group.formats.length > 0);

  const toggle = (ids: number[]) => {
    const allOn = ids.every((id) => itemIds.includes(id));
    onChange(allOn ? itemIds.filter((id) => !ids.includes(id)) : [...new Set([...itemIds, ...ids])]);
  };

  return (
    <nav aria-label="Product formats" className="flex h-full flex-col overflow-hidden bg-card text-[11px]">
      <div className="flex-1 overflow-y-auto">
        <button
          type="button"
          aria-current={itemIds.length === 0 ? "true" : undefined}
          onClick={() => onChange([])}
          className="flex w-full items-center gap-2 border-b border-l-2 border-transparent px-4 py-2 text-left font-medium hover:bg-muted aria-[current=true]:border-primary aria-[current=true]:bg-accent aria-[current=true]:text-primary"
        >
          All formats
        </button>
        {formats.isPending && (
          <div className="p-3">
            <LoadingState label="Loading formats…" />
          </div>
        )}
        {formats.isError && (
          <div className="p-2">
            <ApiError error={formats.error} retry={() => void formats.refetch()} />
          </div>
        )}
        {groups.map((group) => (
          <section key={group.title} className="border-b pb-1">
            <h2 className="border-b bg-muted/60 px-4 py-2 text-[10px] font-medium tracking-wide text-muted-foreground">{group.title}</h2>
            {group.formats.map((format) => {
              const ids = format.items.map((item) => item.id);
              const picked = ids.filter((id) => itemIds.includes(id)).length;
              const baseTypes = new Set(format.items.map((item) => item.baseType));
              const baseType = baseTypes.size === 1 ? [...baseTypes][0] : null;
              return (
                <div key={format.id}>
                  <Row
                    label={format.name}
                    count={format.count}
                    state={picked === 0 ? "none" : picked === ids.length ? "all" : "some"}
                    tag={baseType && <span className="rounded-sm bg-muted px-1 text-[9px] font-normal text-muted-foreground">{baseType}</span>}
                    onClick={() => toggle(ids)}
                  />
                  {format.items.map((item) => (
                    <Row
                      key={item.id}
                      indent
                      label={item.name}
                      count={item.count}
                      state={itemIds.includes(item.id) ? "all" : "none"}
                      onClick={() => toggle([item.id])}
                    />
                  ))}
                </div>
              );
            })}
          </section>
        ))}
        {formats.data?.length === 0 && (
          <p className="p-4 text-[10px] leading-relaxed text-muted-foreground">No product formats yet. Add a format in Data Input to get started.</p>
        )}
      </div>
      <SelectionSummary count={selectionCount} label={selectionLabel} onClear={onClear} onMap={onMap} />
    </nav>
  );
}
