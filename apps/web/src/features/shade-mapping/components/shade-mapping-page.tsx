import type { Shade } from "@color-bank-hub/contracts/shade";
import { Info, RotateCcw } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { ProductDetailPanel } from "@/components/shared/product-detail-panel";
import { ApiError } from "@/components/shared/request-feedback";
import {
  EmptyState,
  LoadingState,
  PageToolbar,
  ShadeSwatch,
} from "@/components/shared/workspace-components";
import { Button } from "@/components/ui/button";
import { useProductFormats } from "@/api/product-formats/product-format-queries";
import { useShade } from "@/api/shades/shade-queries";
import { MappingSidebar } from "./mapping-sidebar";

// Display labels for the stored lowercase enums.
const labels = {
  warm: "Warm",
  neutral: "Neutral",
  cool: "Cool",
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
} as const;

export function ShadeMappingPage() {
  const formats = useProductFormats();
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [itemId, setItemId] = useState<number | null>(null);
  const [selected, setSelected] = useState(new Map<string, Shade>());
  const [generated, setGenerated] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const detail = useShade(activeId);
  const active = detail.data;

  function changeSelected(next: Map<string, Shade>) {
    setSelected(next);
    // The map shows what was generated; a new pick needs a new Generate.
    setGenerated(false);
  }

  function reset() {
    setCategoryId(null);
    setItemId(null);
    changeSelected(new Map());
    setActiveId(null);
  }

  return (
    <PageShell
      section="Shade Mapping"
      wideSidebar
      detailPanel={
        detail.isFetching ? (
          <LoadingState label="Loading shade profile…" />
        ) : detail.isError ? (
          <div className="p-3">
            <ApiError
              error={detail.error}
              retry={() => void detail.refetch()}
            />
          </div>
        ) : active ? (
          <ProductDetailPanel
            key={active.id}
            shade={{
              brand: active.brand.name,
              product: active.product.name,
              shade: active.name,
              hex: active.hex,
              undertone: active.undertone ? labels[active.undertone] : null,
              season: active.season ? labels[active.season] : null,
              format: active.formatItem.name,
              ingredients:
                active.product.ingredientsInci ?? "No ingredients recorded.",
              composition: active.composition ?? undefined,
              lipPhotoUrl: active.lipPhotoUrl ?? undefined,
              swatchPhotoUrl: active.swatchPhotoUrl ?? undefined,
            }}
            canViewComposition={active.brand.isOwn}
          />
        ) : (
          <div className="flex h-full flex-col">
            <h2 className="border-b px-4 py-3 text-[10px] font-medium tracking-wide">
              PRODUCT DETAIL
            </h2>
            <p className="flex flex-1 flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
              <Info className="size-5" />
              Click a shade on the map
            </p>
          </div>
        )
      }
      sidebar={
        formats.isPending ? (
          <LoadingState />
        ) : formats.isError ? (
          <p className="p-3 text-[11px] text-destructive">
            Could not load product formats.
          </p>
        ) : (
          <MappingSidebar
            formats={formats.data}
            categoryId={categoryId}
            itemId={itemId}
            onCategoryChange={(id) => {
              setCategoryId(id);
              setItemId(null);
            }}
            onItemChange={setItemId}
            selected={selected}
            onSelectedChange={changeSelected}
            generated={generated}
            onGenerate={() => setGenerated(true)}
            activeId={activeId}
            onOpenShade={(shade) => setActiveId(shade.id)}
          />
        )
      }
    >
      <PageToolbar title="Shade Map">
        <Button variant="ghost" onClick={reset}>
          <RotateCcw />
          Reset
        </Button>
      </PageToolbar>
      <div className="p-5">
        <div className="min-h-[560px] rounded-md border bg-card">
          {generated ? (
            // shortcut: plain swatch list; the diagram (axes, placement, detail on click) is not designed yet.
            <div className="p-4">
              <p className="mb-3 text-xs text-muted-foreground">
                {selected.size} shades ready to map.
              </p>
              <div className="flex flex-wrap gap-4">
                {[...selected.values()].map((shade) => (
                  <button
                    type="button"
                    key={shade.id}
                    onClick={() => setActiveId(shade.id)}
                    className="flex w-20 flex-col items-center gap-1 rounded p-1 text-center text-[10px] focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ShadeSwatch
                      hex={shade.hex}
                      size="lg"
                      className={
                        shade.id === activeId
                          ? "ring-2 ring-primary ring-offset-2"
                          : undefined
                      }
                    />
                    {shade.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </PageShell>
  );
}
