import { type ReactNode, useMemo, useState } from "react";
import { ChevronDown, Palette } from "lucide-react";
import { useProductFormats } from "@/api/product-formats/product-format-queries";
import { ApiError } from "@/components/shared/request-feedback";
import { LoadingState } from "@/components/shared/workspace-components";
export type FormatSelection = { type: "segment"; id: number } | { type: "subsegment"; id: number } | null;

export function CatalogSidebar({
  value,
  onChange,
  sortAlphabetical = false,
  footer,
}: {
  value: FormatSelection | number | null;
  onChange: (selection: FormatSelection) => void;
  sortAlphabetical?: boolean;
  footer?: ReactNode;
}) {
  const formats = useProductFormats();
  const [collapsed, setCollapsed] = useState<number[]>([]);

  const normalizedValue: FormatSelection = typeof value === "number" ? { type: "subsegment", id: value } : (value ?? null);

  const formatList = useMemo(() => {
    if (!formats.data) return [];
    if (!sortAlphabetical) return formats.data;

    return [...formats.data]
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
      .map((format) => ({
        ...format,
        items: [...format.items].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
      }));
  }, [formats.data, sortAlphabetical]);

  return (
    <nav aria-label="Product formats" className="flex h-full flex-col overflow-hidden bg-card text-[11px]">
      <div className="flex-1 overflow-y-auto py-3">
        <h2 className="px-4 py-2 text-[10px] tracking-wide text-muted-foreground">PRODUCT FORMATS</h2>
        <button
          type="button"
          aria-current={normalizedValue === null ? "true" : undefined}
          className="flex w-full items-center gap-2 border-l-2 border-transparent px-4 py-2 text-left hover:bg-muted aria-[current=true]:border-primary aria-[current=true]:bg-accent aria-[current=true]:text-primary"
          onClick={() => onChange(null)}
        >
          <Palette className="size-3" />
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
        {formatList.map((format) => {
          const isSegmentSelected = normalizedValue?.type === "segment" && normalizedValue.id === format.id;
          const isCollapsed = collapsed.includes(format.id);

          return (
            <div key={format.id}>
              <div
                aria-current={isSegmentSelected ? "true" : undefined}
                className="flex w-full items-center border-l-2 border-transparent px-3 py-2 text-left font-medium hover:bg-muted aria-[current=true]:border-primary aria-[current=true]:bg-accent aria-[current=true]:text-primary group"
              >
                <button
                  type="button"
                  aria-label={isCollapsed ? `Expand ${format.name}` : `Collapse ${format.name}`}
                  className="p-1 -ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setCollapsed((prev) => (isCollapsed ? prev.filter((id) => id !== format.id) : [...prev, format.id]))}
                >
                  <ChevronDown className={`size-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-between text-left ml-1"
                  onClick={() => {
                    onChange({ type: "segment", id: format.id });
                    if (isCollapsed) {
                      setCollapsed((prev) => prev.filter((id) => id !== format.id));
                    }
                  }}
                >
                  <span>{format.name}</span>
                  <span className="text-[10px] text-muted-foreground group-aria-[current=true]:text-primary/80">{format.count ?? 0}</span>
                </button>
              </div>
              {!isCollapsed &&
                format.items.map((item) => {
                  const isSubsegmentSelected = normalizedValue?.type === "subsegment" && normalizedValue.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={isSubsegmentSelected ? "true" : undefined}
                      onClick={() => onChange({ type: "subsegment", id: item.id })}
                      className="flex w-full items-center gap-2 border-l-2 border-transparent py-2 pr-4 pl-8 text-left text-muted-foreground hover:bg-muted aria-[current=true]:border-primary aria-[current=true]:bg-accent aria-[current=true]:text-primary"
                    >
                      <span className="size-1 rounded-full bg-chart-2" />
                      {item.name}
                      <span className="ml-auto text-[10px]">{item.count ?? 0}</span>
                    </button>
                  );
                })}
            </div>
          );
        })}
        {formats.data?.length === 0 && (
          <p className="p-4 text-[10px] leading-relaxed text-muted-foreground">No product formats yet. Add a format in Data Input to get started.</p>
        )}
      </div>
      {footer && <div className="shrink-0 border-t p-3 space-y-3 bg-card">{footer}</div>}
    </nav>
  );
}
