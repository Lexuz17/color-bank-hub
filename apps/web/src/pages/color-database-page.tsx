import type { Shade } from "@color-bank-hub/contracts/shade";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "cn";
import { AlertTriangle, FlaskConical, Info, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useProductFormats } from "@/api/product-formats/product-format-queries";
import { CatalogSidebar, type FormatSelection } from "@/components/catalog/catalog-sidebar";
import { PageShell } from "@/components/layout/page-shell";
import { ShadeDatabase } from "@/components/shades/shade-database";
import { PageToolbar } from "@/components/shared/workspace-components";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ColorDatabasePage() {
  const navigate = useNavigate();
  const formats = useProductFormats();
  const [selection, setSelection] = useState<FormatSelection>(null);
  const [selectedShades, setSelectedShades] = useState<Map<string, Shade>>(new Map());
  const [crossFormatOpen, setCrossFormatOpen] = useState(false);

  const activeTitle = useMemo(() => {
    if (!selection) return "Color Database";
    if (selection.type === "segment") {
      const segment = formats.data?.find((f) => f.id === selection.id);
      return segment ? `${segment.name} › All ${segment.name}` : "Color Database";
    }
    for (const format of formats.data ?? []) {
      const item = format.items.find((it) => it.id === selection.id);
      if (item) {
        return `${format.name} › ${item.name}`;
      }
    }
    return "Color Database";
  }, [selection, formats.data]);

  function toggleShade(shade: Shade, checked: boolean) {
    setSelectedShades((prev) => {
      const next = new Map(prev);
      if (checked) next.set(shade.id, shade);
      else next.delete(shade.id);
      return next;
    });
  }

  function selectAll(shades: Shade[], checked: boolean) {
    setSelectedShades((prev) => {
      const next = new Map(prev);
      for (const shade of shades) {
        if (checked) next.set(shade.id, shade);
        else next.delete(shade.id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedShades(new Map());
  }

  const formatSummary = useMemo(() => {
    const map = new Map<number, { name: string; baseType: string | null; count: number }>();
    for (const shade of selectedShades.values()) {
      const item = shade.formatItem;
      if (!item) continue;
      const existing = map.get(item.id);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(item.id, {
          name: item.name,
          baseType: item.baseType,
          count: 1,
        });
      }
    }
    return map;
  }, [selectedShades]);

  const formatSubtitle = useMemo(() => {
    if (formatSummary.size === 0) return "";
    if (formatSummary.size === 1) {
      return Array.from(formatSummary.values())[0]?.name ?? "format";
    }
    return `${formatSummary.size} formats`;
  }, [formatSummary]);

  function proceedToMapping() {
    const shadesList = Array.from(selectedShades.values());
    const shadeIds = shadesList.map((s) => s.id).join(",");
    const targetItemId = shadesList[0]?.formatItem?.id ?? (selection?.type === "subsegment" ? selection.id : undefined);

    try {
      sessionStorage.setItem("color_bank_preselected_shades", JSON.stringify(shadesList));
    } catch {
      // sessionStorage unavailable or quota exceeded
    }

    void navigate({
      to: "/shade-mapping",
      search: {
        itemId: targetItemId ?? undefined,
        shadeIds: shadeIds || undefined,
      },
    });
  }

  function handleMapSelected() {
    if (selectedShades.size === 0) return;
    if (formatSummary.size > 1) {
      setCrossFormatOpen(true);
    } else {
      proceedToMapping();
    }
  }

  const sidebarFooter =
    selectedShades.size > 0 ? (
      <div className="space-y-2.5">
        <div className="rounded-lg border bg-muted/50 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
          <div className="flex items-start gap-2">
            <Info className="size-4 shrink-0 text-foreground/70 mt-0.5" />
            <div>
              <strong className="font-semibold text-foreground">Benchmark rule:</strong> benchmarks can only be set within the same parent format and
              finish (e.g. Lip Matte Cream ↔ Lip Matte Cream and Matte Lipstick only).
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#f3d9d3] bg-[#faf0ee] p-2.5 text-[11px] space-y-2.5 dark:border-rose-900/40 dark:bg-rose-950/25">
          <div className="font-semibold text-[#8a382c] dark:text-rose-300">
            <span>
              {selectedShades.size} {selectedShades.size === 1 ? "shade" : "shades"}
            </span>{" "}
            selected from <span>{formatSubtitle}</span>
          </div>
          <div className="flex flex-col-reverse gap-1.5 w-full">
            <Button type="button" variant="outline" size="sm" className="w-full justify-center" onClick={clearSelection}>
              Clear
            </Button>
            <Button type="button" size="sm" className="w-full justify-center" onClick={handleMapSelected}>
              Map selected
            </Button>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <PageShell
      section="Color Database"
      sidebar={
        <CatalogSidebar
          value={selection}
          sortAlphabetical
          onChange={(newSelection) => {
            setSelection(newSelection);
            clearSelection();
          }}
          footer={sidebarFooter}
        />
      }
    >
      <PageToolbar
        title={activeTitle}
        description={selection ? "Browse products and shades in this format" : "Browse products and shades from the database"}
      />
      <div className="p-5">
        <ShadeDatabase
          key={selection ? `${selection.type}-${selection.id}` : "all"}
          productFormatId={selection?.type === "segment" ? selection.id : undefined}
          productFormatItemId={selection?.type === "subsegment" ? selection.id : undefined}
          selected={selectedShades}
          onToggleSelect={toggleShade}
          onSelectAll={selectAll}
        />
      </div>

      <Dialog open={crossFormatOpen} onOpenChange={setCrossFormatOpen}>
        <DialogContent className="max-w-lg space-y-3">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-base font-semibold">Cross-format mapping detected</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-normal">
                  You're mixing products from different base types.
                  <br />
                  The map will still generate, but please read the notes below carefully.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <p className="font-medium text-foreground mb-1.5">Formats in this selection:</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(formatSummary.values()).map((item, idx) => (
                  <div
                    key={item.name}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium",
                      idx % 2 === 0
                        ? "border-pink-200 bg-pink-50/80 text-pink-900 dark:border-pink-900/40 dark:bg-pink-950/40 dark:text-pink-300"
                        : "border-purple-200 bg-purple-50/80 text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/40 dark:text-purple-300",
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    <div>
                      <span>{item.name}</span>
                      <span className="ml-1 text-[10px] opacity-75">({item.count} SKU selected)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
              <div className="flex items-center gap-1.5 font-semibold text-xs mb-1.5">
                <FlaskConical className="size-4" />
                Pay attention to base ingredients
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed opacity-95">
                <li>
                  <strong>Powder formulations</strong> — talc-based, dry texture, oil-free. Pigment behavior differs from liquid bases.
                </li>
                <li>
                  <strong>Liquid / Cream formulations</strong> — emulsion or oil-based, skin interaction and pigment load are different.
                </li>
                <li>
                  Direct color comparisons across these types can be misleading — a shade may appear the same on screen but perform very differently
                  on skin.
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200 flex items-start gap-2">
              <Users className="size-4 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Consult R&D before cross-benchmark</strong> — if you plan to use a shade from a different format as a benchmark target, loop
                in the R&D team first to validate the formulation approach.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-between sm:justify-between pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCrossFormatOpen(false)}>
              Go back & review
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-[#b85444] text-white hover:bg-[#a34738]"
              onClick={() => {
                setCrossFormatOpen(false);
                proceedToMapping();
              }}
            >
              I understand - generate anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
