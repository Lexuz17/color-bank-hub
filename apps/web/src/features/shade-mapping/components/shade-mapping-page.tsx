import type { Shade } from "@color-bank-hub/contracts/shade";
import { useSearch } from "@tanstack/react-router";
import { Download, Eye, EyeOff, Info, Maximize, RotateCcw, Save, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import { ProductDetailPanel } from "@/components/shared/product-detail-panel";
import { ApiError } from "@/components/shared/request-feedback";
import { EmptyState, LoadingState } from "@/components/shared/workspace-components";
import { Button } from "@/components/ui/button";
import { useActiveConfig } from "@/api/classification-configs/classification-config-queries";
import { useProductFormats } from "@/api/product-formats/product-format-queries";
import { useShade, useShades } from "@/api/shades/shade-queries";
import type { AxisKey } from "@/components/shared/map-axes";
import { MapToolbar } from "./map-toolbar";
import { MappingSidebar } from "./mapping-sidebar";
import { SaveMappingDialog } from "./save-mapping-dialog";
import { type MapView, ShadeMap, type ShadeMapHandle } from "@/components/shared/shade-map";
import { useCreateMapping, useUpdateMapping } from "../hooks/mapping-mutations";
import { useMapping } from "../hooks/mapping-queries";

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
  const [selectedShades, setSelectedShades] = useState(new Map<string, Shade>());
  const [generated, setGenerated] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const shadeDetail = useShade(activeId);
  const activeShade = shadeDetail.data;

  const [zoom, setZoom] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ShadeMapHandle>(null);
  const createMapping = useCreateMapping();
  const updateMapping = useUpdateMapping();
  const wheelZoom = useCallback((factor: number) => setZoom((current) => Math.min(maxZoom, Math.max(1, current * factor))), []);

  const [mapName, setMapName] = useState("Shade Map");
  const [notes, setNotes] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  // The saved map being edited. Without it, Save creates a new map.
  const [mappingId, setMappingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<MapView>("season");
  const [axisX, setAxisX] = useState<AxisKey>("lchC");
  const [axisY, setAxisY] = useState<AxisKey>("hslL");
  const [showPhoto, setShowPhoto] = useState(false);
  const [showScale, setShowScale] = useState(false);
  const [hideProductName, setHideProductName] = useState(false);
  const activeConfig = useActiveConfig(generated ? itemId : null);

  const routeSearch = useSearch({ strict: false }) as { itemId?: number; productId?: string; mappingId?: string };
  const savedMapping = useMapping(routeSearch.mappingId ?? null);
  // Opened from an automatic map of My Mappings: every shade of that product.
  // shortcut: first 100 shades (API page limit), page through them when one product passes 100.
  const brandShades = useShades(
    { productId: routeSearch.productId, productFormatItemId: routeSearch.itemId, pageSize: 100 },
    !!routeSearch.productId && !!routeSearch.itemId,
  );

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("color_bank_preselected_shades");
      if (cached) {
        const parsed = JSON.parse(cached) as Shade[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const preselected = new Map<string, Shade>();
          for (const shade of parsed) {
            preselected.set(shade.id, shade);
          }
          setSelectedShades(preselected);
          const initialItemId = routeSearch?.itemId ?? parsed[0]?.formatItem?.id ?? null;
          if (initialItemId) setItemId(initialItemId);
          if (parsed[0]?.formatItem?.productFormatId) {
            setCategoryId(parsed[0].formatItem.productFormatId);
          }
          sessionStorage.removeItem("color_bank_preselected_shades");
          return;
        }
      }
    } catch {
      // ignore
    }

    if (routeSearch?.itemId) {
      setItemId(routeSearch.itemId);
    }
  }, [routeSearch?.itemId]);

  useEffect(() => {
    const mapping = savedMapping.data;
    if (!mapping) return;
    setMappingId(mapping.id);
    setItemId(mapping.productFormatItemId);
    setSelectedShades(new Map(mapping.shades.map((shade) => [shade.id, shade])));
    setMapName(mapping.name);
    setNotes(mapping.notes ?? "");
    setViewMode(mapping.viewMode);
    if (mapping.axisX && mapping.axisY) {
      setAxisX(mapping.axisX as AxisKey);
      setAxisY(mapping.axisY as AxisKey);
    }
    setShowPhoto(mapping.showPhoto);
    setHideProductName(mapping.hideProductName);
    setGenerated(true);
  }, [savedMapping.data]);

  useEffect(() => {
    const first = brandShades.data?.items[0];
    if (!brandShades.data || !first) return;
    setSelectedShades(new Map(brandShades.data.items.map((shade) => [shade.id, shade])));
    setMapName(`${first.brand.name} — ${first.formatItem.name}`);
    setGenerated(true);
  }, [brandShades.data]);

  useEffect(() => {
    if (itemId && formats.data && !categoryId) {
      for (const format of formats.data) {
        if (format.items.some((item) => item.id === itemId)) {
          setCategoryId(format.id);
          break;
        }
      }
    }
  }, [itemId, formats.data, categoryId]);

  function changeSelectedShades(next: Map<string, Shade>) {
    setSelectedShades(next);
    setGenerated(false);
  }

  function saveMapping(name: string, notes: string) {
    if (!itemId) return;
    setMapName(name);
    setNotes(notes);
    const input = {
      name,
      notes,
      productFormatItemId: itemId,
      shadeIds: [...selectedShades.keys()],
      viewMode,
      axisX,
      axisY,
      showPhoto,
      hideProductName,
    };
    if (mappingId) updateMapping.mutate({ id: mappingId, input }, { onSuccess: () => setSaveOpen(false) });
    else
      createMapping.mutate(input, {
        onSuccess: (mapping) => {
          setMappingId(mapping.id);
          setSaveOpen(false);
        },
      });
  }

  function downloadMap() {
    try {
      const link = document.createElement("a");
      link.href = mapRef.current?.png() ?? "";
      link.download = `${mapName || "Shade Map"}.png`;
      link.click();
    } catch {
      // A canvas that drew an image from another server cannot be exported.
      toast.error("Could not download the map with photos. Turn off view photo and try again.");
    }
  }

  function resetMap() {
    setZoom(1);
    setCategoryId(null);
    setItemId(null);
    changeSelectedShades(new Map());
    setActiveId(null);
    setMappingId(null);
    setNotes("");
  }

  return (
    <PageShell
      section="Shade Mapping"
      wideSidebar
      detailPanel={
        shadeDetail.isFetching ? (
          <LoadingState label="Loading shade profile…" />
        ) : shadeDetail.isError ? (
          <div className="p-3">
            <ApiError error={shadeDetail.error} retry={() => void shadeDetail.refetch()} />
          </div>
        ) : activeShade ? (
          <ProductDetailPanel
            key={activeShade.id}
            shade={{
              brand: activeShade.brand.name,
              product: activeShade.product.name,
              shade: activeShade.name,
              hex: activeShade.hex,
              undertone: activeShade.undertone ? labels[activeShade.undertone] : null,
              season: activeShade.season ? labels[activeShade.season] : null,
              format: activeShade.formatItem.name,
              tags: [],
              benchmarkedTo: activeShade.benchmarkedTo?.map((ref) => `${ref.brand} ${ref.product} ${ref.name}`),
              benchmarkFor: activeShade.benchmarkFor?.map((ref) => `${ref.brand} ${ref.product} ${ref.name}`),
              ingredients: activeShade.ingredientsInci ?? undefined,
              mayContain: activeShade.mayContain ?? undefined,
              composition: activeShade.composition ?? undefined,
              lipPhotoUrl: activeShade.lipPhotoUrl ?? undefined,
              swatchPhotoUrl: activeShade.swatchPhotoUrl ?? undefined,
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
            selected={selectedShades}
            onSelectedChange={changeSelectedShades}
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
          name={mapName}
          onNameChange={setMapName}
          view={viewMode}
          onViewChange={setViewMode}
          axisX={axisX}
          axisY={axisY}
          onAxesChange={(x, y) => {
            setAxisX(x);
            setAxisY(y);
            setViewMode("custom");
          }}
          showPhoto={showPhoto}
          onShowPhotoChange={setShowPhoto}
          showScale={showScale}
          onShowScaleChange={setShowScale}
        />
        {/* Full screen shows the map and its button bar. */}
        <div ref={stageRef} className="flex min-h-0 flex-1 flex-col bg-card">
          <div className="relative min-h-140 flex-1">
            {generated ? (
              <div className="absolute inset-0">
                <ShadeMap
                  ref={mapRef}
                  zoom={zoom}
                  onWheelZoom={wheelZoom}
                  shades={[...selectedShades.values()]}
                  view={viewMode}
                  axisX={axisX}
                  axisY={axisY}
                  config={activeConfig.data}
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
            {generated && activeConfig.isError && <p className="mr-auto">region cut-offs unavailable</p>}
            <div className="flex shrink-0 gap-1.5">
              <Button size="sm" variant="outline" onClick={() => setHideProductName(!hideProductName)}>
                {hideProductName ? <Eye /> : <EyeOff />}
                {hideProductName ? "show product name" : "hide product name"}
              </Button>
              <Button size="sm" variant="outline" onClick={resetMap}>
                <RotateCcw />
                reset
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!generated || createMapping.isPending || updateMapping.isPending}
                onClick={() => setSaveOpen(true)}
              >
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
                onClick={() => void (document.fullscreenElement ? document.exitFullscreen() : stageRef.current?.requestFullscreen())}
              >
                <Maximize />
              </Button>
              <Button size="sm" variant="outline" disabled={!generated} onClick={downloadMap}>
                <Download />
                download
              </Button>
            </div>
          </div>
        </div>
      </div>
      {saveOpen && (
        <SaveMappingDialog
          initialName={mapName}
          initialNotes={notes}
          saving={createMapping.isPending || updateMapping.isPending}
          onSave={saveMapping}
          onClose={() => setSaveOpen(false)}
        />
      )}
    </PageShell>
  );
}
