import { useState } from "react";
import { ChevronDown, Palette } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/services/catalog-api";
import { ApiError } from "@/components/shared/request-feedback";
import { LoadingState } from "@/components/shared/workspace-components";
export function CatalogSidebar({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  const formats = useQuery({
    queryKey: ["formats"],
    queryFn: ({ signal }) => catalogApi.formats(signal),
  });
  const [collapsed, setCollapsed] = useState<number[]>([]);
  return (
    <nav
      aria-label="Product formats"
      className="h-full overflow-y-auto bg-card py-3 text-[11px]"
    >
      <h2 className="px-4 py-2 text-[10px] tracking-wide text-muted-foreground">
        PRODUCT FORMATS
      </h2>
      <button
        type="button"
        aria-current={value === null ? "true" : undefined}
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
          <ApiError
            error={formats.error}
            retry={() => void formats.refetch()}
          />
        </div>
      )}
      {formats.data?.map((format) => (
        <div key={format.id}>
          <button
            type="button"
            aria-expanded={!collapsed.includes(format.id)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium hover:bg-muted"
            onClick={() =>
              setCollapsed((prev) =>
                prev.includes(format.id)
                  ? prev.filter((id) => id !== format.id)
                  : [...prev, format.id],
              )
            }
          >
            <ChevronDown
              className={`size-3 ${collapsed.includes(format.id) ? "-rotate-90" : ""}`}
            />
            {format.name}
            <span className="ml-auto text-[10px] text-muted-foreground">
              {format.count ?? 0}
            </span>
          </button>
          {!collapsed.includes(format.id) &&
            format.items.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={value === item.id ? "true" : undefined}
                onClick={() => onChange(item.id)}
                className="flex w-full items-center gap-2 border-l-2 border-transparent py-2 pr-4 pl-8 text-left text-muted-foreground hover:bg-muted aria-[current=true]:border-primary aria-[current=true]:bg-accent aria-[current=true]:text-primary"
              >
                <span className="size-1 rounded-full bg-chart-2" />
                {item.name}
                <span className="ml-auto text-[10px]">{item.count ?? 0}</span>
              </button>
            ))}
        </div>
      ))}
      {formats.data?.length === 0 && (
        <p className="p-4 text-[10px] leading-relaxed text-muted-foreground">
          No product formats yet. Add a format in Data Input to get started.
        </p>
      )}
    </nav>
  );
}
