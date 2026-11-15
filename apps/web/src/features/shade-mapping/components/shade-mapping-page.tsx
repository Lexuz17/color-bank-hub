import type { Shade } from "@color-bank-hub/contracts/shade";
import { Download, Eye, EyeOff, Info, Maximize, RotateCcw, Save, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import { ProductDetailPanel } from "@/components/shared/product-detail-panel";
import { ApiError } from "@/components/shared/request-feedback";
import { EmptyState, LoadingState } from "@/components/shared/workspace-components";
import { Button } from "@/components/ui/button";
import { useActiveConfig } from "@/api/classification-configs/classification-config-queries";
import { useProductFormats } from "@/api/product-formats/product-format-queries";
import { useShade } from "@/api/shades/shade-queries";
import type { AxisKey } from "@/components/shared/map-axes";
import { MapToolbar } from "./map-toolbar";
import { MappingSidebar } from "./mapping-sidebar";
import { type MapView, ShadeMap, type ShadeMapHandle } from "@/components/shared/shade-map";
import { useCreateMapping } from "../hooks/mapping-mutations";

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

const maxZoom = 6;

export function ShadeMappingPage() {
  const formats = useProductFormats();
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [itemId, setItemId] = useState<number | null>(null);
  const [selected, setSelected] = useState(new Map<string, Shade>());
  const [generated, setGenerated] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const detail = useShade(activeId);
  const active = detail.data;

  const [zoom, setZoom] = useState(1);
  const stage = useRef<HTMLDivElement>(null);
  const map = useRef<ShadeMapHandle>(null);
  const create = useCreateMapping();
  const wheelZoom = useCallback((factor: number) => setZoom((current) => Math.min(maxZoom, Math.max(1, current * factor))), []);

  const [name, setName] = useState("Shade Map");
  const [view, setView] = useState<MapView>("season");
  const [axisX, setAxisX] = useState<AxisKey>("lchC");
  const [axisY, setAxisY] = useState<AxisKey>("hslL");
  const [showPhoto, setShowPhoto] = useState(false);
  const [showScale, setShowScale] = useState(false);
  const [hideProductName, setHideProductName] = useState(false);
  const config = useActiveConfig(generated ? itemId : null);

  function changeSelected(next: Map<string, Shade>) {
    setSelected(next);
    setGenerated(false);
  }

  function save() {
    if (!itemId) return;
    create.mutate({ name, productFormatItemId: itemId, shadeIds: [...selected.keys()], viewMode: view, axisX, axisY, showPhoto, hideProductName });
  }

  function download() {
    try {
      const link = document.createElement("a");
      link.href = map.current?.png() ?? "";
      link.download = `${name || "Shade Map"}.png`;
      link.click();
    } catch {
      // A canvas that drew an image from another server cannot be exported.
      toast.error("Could not download the map with photos. Turn off view photo and try again.");
    }
  }

  function reset() {
    setZoom(1);
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
            <ApiError error={detail.error} retry={() => void detail.refetch()} />
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
              tags: [],
              benchmarkedTo: active.benchmarkedTo?.map((ref) => `${ref.brand} ${ref.product} ${ref.name}`),
              benchmarkFor: active.benchmarkFor?.map((ref) => `${ref.brand} ${ref.product} ${ref.name}`),
              ingredients: active.ingredientsInci ?? undefined,
              mayContain: active.mayContain ?? undefined,
              composition: active.composition ?? undefined,
              lipPhotoUrl: active.lipPhotoUrl ?? undefined,
              swatchPhotoUrl: active.swatchPhotoUrl ?? undefined,
            }}
          />
        ) : (
          <div className="flex h-full flex-col">
            <h2 className="border-b px-4 py-3 text-[10px] font-medium tracking-wide">PRODUCT DETAIL</h2>
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
          <p className="p-3 text-[11px] text-destructive">Could not load product formats.</p>
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
      <div className="flex h-full flex-col">
        <MapToolbar
          name={name}
          onNameChange={setName}
          view={view}
          onViewChange={setView}
          axisX={axisX}
          axisY={axisY}
          onAxesChange={(x, y) => {
            setAxisX(x);
            setAxisY(y);
            setView("custom");
          }}
          showPhoto={showPhoto}
          onShowPhotoChange={setShowPhoto}
          showScale={showScale}
          onShowScaleChange={setShowScale}
        />
        {/* Full screen shows the map and its button bar. */}
        <div ref={stage} className="flex min-h-0 flex-1 flex-col bg-card">
          <div className="relative min-h-140 flex-1">
            {generated ? (
              <div className="absolute inset-0">
                <ShadeMap
                  ref={map}
                  zoom={zoom}
                  onWheelZoom={wheelZoom}
                  shades={[...selected.values()]}
                  view={view}
                  axisX={axisX}
                  axisY={axisY}
                  config={config.data}
                  showPhoto={showPhoto}
                  showScale={showScale}
                  hideProductName={hideProductName}
                  activeId={activeId}
                  onOpen={setActiveId}
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <EmptyState />
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center justify-end gap-3 overflow-x-auto border-t px-5 py-2 text-[11px] text-destructive">
            {generated && config.isError && <p className="mr-auto">region cut-offs unavailable</p>}
            <div className="flex shrink-0 gap-1.5">
              <Button size="sm" variant="outline" onClick={() => setHideProductName(!hideProductName)}>
                {hideProductName ? <Eye /> : <EyeOff />}
                {hideProductName ? "show product name" : "hide product name"}
              </Button>
              <Button size="sm" variant="outline" onClick={reset}>
                <RotateCcw />
                reset
              </Button>
              <Button size="sm" variant="outline" disabled={!generated || create.isPending} onClick={save}>
                <Save />
                save
              </Button>
              <Button
                size="sm"
                variant="outline"
                aria-label="Zoom in"
                disabled={!generated || zoom >= maxZoom}
                onClick={() => setZoom(Math.min(maxZoom, zoom + 0.5))}
              >
                <ZoomIn />
              </Button>
              <Button
                size="sm"
                variant="outline"
                aria-label="Zoom out"
                disabled={!generated || zoom <= 1}
                onClick={() => setZoom(Math.max(1, zoom - 0.5))}
              >
                <ZoomOut />
              </Button>
              <Button
                size="sm"
                variant="outline"
                aria-label="Full screen"
                onClick={() => void (document.fullscreenElement ? document.exitFullscreen() : stage.current?.requestFullscreen())}
              >
                <Maximize />
              </Button>
              <Button size="sm" variant="outline" disabled={!generated} onClick={download}>
                <Download />
                download
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
