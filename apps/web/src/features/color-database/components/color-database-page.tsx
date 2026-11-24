import { benchmarkAllowedWith, breaksBenchmarkRule } from "@color-bank-hub/contracts/catalog";
import type { Shade } from "@color-bank-hub/contracts/shade";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useProductFormats } from "@/api/product-formats/product-format-queries";
import { useInfiniteShades } from "@/api/shades/shade-queries";
import { PageShell } from "@/components/layout/page-shell";
import { ApiError } from "@/components/shared/request-feedback";
import { LoadingState, SearchInput } from "@/components/shared/workspace-components";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useLoadMoreOnScroll } from "../hooks/use-load-more-on-scroll";
import { CrossFormatDialog } from "./cross-format-dialog";
import { FormatSidebar } from "./format-sidebar";
import { ShadeTable } from "./shade-table";

const PAGE_SIZE = 50;

export function ColorDatabasePage() {
  const navigate = useNavigate();
  const formats = useProductFormats();
  const [itemIds, setItemIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Map<string, Shade>>(new Map());
  const [crossFormatOpen, setCrossFormatOpen] = useState(false);

  const shades = useInfiniteShades({
    pageSize: PAGE_SIZE,
    search: search || undefined,
    productFormatItemIds: itemIds.join(",") || undefined,
  });

  const loadedShades = shades.data?.pages.flatMap((page) => page.items) ?? [];
  const total = shades.data?.pages[0]?.pagination.total ?? 0;

  const bottomMarkerRef = useLoadMoreOnScroll({
    hasMore: shades.hasNextPage,
    isLoading: shades.isFetchingNextPage,
    loadMore: () => void shades.fetchNextPage(),
    loadedCount: loadedShades.length,
  });

  const pickedItems =
    formats.data?.flatMap((format) => format.items.filter((item) => itemIds.includes(item.id)).map((item) => ({ ...item, format }))) ?? [];
  const onlyItem = pickedItems.length === 1 ? pickedItems[0] : undefined;
  const onlyFormat =
    pickedItems.length > 0 && pickedItems.every((item) => item.format.id === pickedItems[0]?.format.id) ? pickedItems[0]?.format : undefined;
  const allowedNames = onlyItem
    ? (benchmarkAllowedWith[onlyItem.code] ?? []).map(
        (code) => formats.data?.flatMap((format) => format.items).find((item) => item.code === code)?.name ?? code,
      )
    : [];

  const selectedShades = [...selected.values()];
  const selectedFormats = new Map<number, { name: string; count: number }>();
  for (const shade of selectedShades) {
    const current = selectedFormats.get(shade.formatItem.id);
    selectedFormats.set(shade.formatItem.id, { name: shade.formatItem.name, count: (current?.count ?? 0) + 1 });
  }
  const selectionLabel = selectedFormats.size === 1 ? ([...selectedFormats.values()][0]?.name ?? "") : `${selectedFormats.size} formats`;

  function changeItems(next: number[]) {
    setItemIds(next);
    // Unticking a format drops its selected shades. "All formats" (empty) keeps the selection.
    if (next.length > 0) setSelected(new Map([...selected].filter(([, shade]) => next.includes(shade.formatItem.id))));
  }

  function toggleShade(shade: Shade, checked: boolean) {
    const next = new Map(selected);
    if (checked) next.set(shade.id, shade);
    else next.delete(shade.id);
    setSelected(next);
  }

  function toggleAll(pageShades: Shade[], checked: boolean) {
    const next = new Map(selected);
    for (const shade of pageShades) {
      if (checked) next.set(shade.id, shade);
      else next.delete(shade.id);
    }
    setSelected(next);
  }

  function openShadeMapping() {
    try {
      sessionStorage.setItem("color_bank_preselected_shades", JSON.stringify(selectedShades));
    } catch {
      // sessionStorage unavailable: Shade Mapping opens empty
    }
    void navigate({ to: "/shade-mapping", search: { itemId: selectedShades[0]?.formatItem.id } });
  }

  function mapSelected() {
    if (breaksBenchmarkRule(selectedShades.map((shade) => shade.formatItem.code))) setCrossFormatOpen(true);
    else openShadeMapping();
  }

  return (
    <PageShell
      section="Color Database"
      sidebar={
        <FormatSidebar
          itemIds={itemIds}
          onChange={changeItems}
          selectionCount={selected.size}
          selectionLabel={selectionLabel}
          onClear={() => setSelected(new Map())}
          onMap={mapSelected}
        />
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-5 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Breadcrumb>
              <BreadcrumbList className="text-sm">
                {onlyItem ? (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        render={<button type="button" className="cursor-pointer" />}
                        onClick={() => changeItems(onlyItem.format.items.map((item) => item.id))}
                      >
                        {onlyItem.format.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-medium">{onlyItem.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : onlyFormat ? (
                  <>
                    <BreadcrumbItem>{onlyFormat.name}</BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-medium">All {onlyFormat.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium">
                      {pickedItems.length > 0 ? `${pickedItems.length} formats` : "Color Database"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
            {onlyItem?.baseType && <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{onlyItem.baseType}</span>}
          </div>
          {onlyItem && (
            <p className="text-[11px] text-muted-foreground">
              Benchmarks allowed: {onlyItem.name} ↔ {allowedNames.join(", ")}
              {allowedNames.length === 1 && " only"}
            </p>
          )}
        </div>
        <SearchInput
          value={search}
          onValueChange={(value) => {
            setSearch(value);
          }}
          className="w-full sm:w-72"
        />
      </div>

      <div>
        {shades.isPending ? (
          <div className="p-5">
            <LoadingState />
          </div>
        ) : shades.isError ? (
          <div className="p-5">
            <ApiError error={shades.error} retry={() => void shades.refetch()} />
          </div>
        ) : (
          <>
            <ShadeTable shades={loadedShades} selected={selected} showFormat={itemIds.length !== 1} onToggle={toggleShade} onToggleAll={toggleAll} />
            <div ref={bottomMarkerRef} className="px-5 py-4 text-center text-[11px] text-muted-foreground">
              {shades.isFetchingNextPage ? "Loading more…" : `${loadedShades.length} of ${total} shades`}
            </div>
          </>
        )}
      </div>

      {crossFormatOpen && (
        <CrossFormatDialog
          formats={[...selectedFormats.values()]}
          onBack={() => setCrossFormatOpen(false)}
          onContinue={() => {
            setCrossFormatOpen(false);
            openShadeMapping();
          }}
        />
      )}
    </PageShell>
  );
}
