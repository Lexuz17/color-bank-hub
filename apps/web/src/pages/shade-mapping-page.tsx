import { useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageToolbar,
  EmptyState,
  ShadeSwatch,
  WorkflowSteps,
} from "@/components/shared/workspace-components";
import { ProductDetailPanel } from "@/components/shared/product-detail-panel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { tableRows, sampleProfile } from "@/lib/data/demo-shades";
import { readMappings, writeMappings } from "@/lib/data/local-mappings";
export function ShadeMappingPage() {
  const saved = (() => {
    try {
      return sessionStorage.getItem("color-bank-open-mapping");
    } catch {
      return null;
    }
  })();
  const initial = readMappings().find((item) => item.id === saved);
  const [selected, setSelected] = useState<string[]>(initial?.shadeNames ?? []);
  const [generated, setGenerated] = useState(!!initial);
  const [active, setActive] = useState(tableRows[4]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const detail = (
    <ProductDetailPanel
      key={active.shade}
      shade={{ ...sampleProfile, ...active }}
      canViewComposition
    />
  );
  return (
    <PageShell
      section="Shade Mapping"
      detailPanel={detail}
      sidebar={
        <div className="p-3">
          <WorkflowSteps
            steps={["Format", "Select SKUs", "Generate"]}
            activeStep={generated ? 2 : 1}
          />
          <p className="mt-4 rounded border bg-accent p-2 text-[10px] text-primary">
            Lip Tint · Lip Tint Gloss
          </p>
          <div className="mt-3 flex justify-between text-[11px]">
            <span>{selected.length} selected</span>
            <button
              type="button"
              className="text-primary"
              onClick={() => {
                setSelected([]);
                setGenerated(false);
              }}
            >
              Clear
            </button>
          </div>
          <div className="mt-2 space-y-1">
            {tableRows.map((row) => (
              <label
                key={row.shade}
                className="flex cursor-pointer items-center gap-2 border-b py-3 text-[10px]"
              >
                <ShadeSwatch hex={row.hex} />
                <span className="flex-1">
                  {row.shade}
                  <span className="block text-[9px] text-muted-foreground">
                    {row.brand} · {row.product}
                  </span>
                </span>
                <Checkbox
                  aria-label={`Map ${row.shade}`}
                  checked={selected.includes(row.shade)}
                  onCheckedChange={(checked) => {
                    setSelected((prev) =>
                      checked
                        ? [...prev, row.shade]
                        : prev.filter((item) => item !== row.shade),
                    );
                    setGenerated(false);
                  }}
                />
              </label>
            ))}
          </div>
          <Button
            className="mt-4 w-full"
            disabled={!selected.length}
            onClick={() => setGenerated(true)}
          >
            Generate
          </Button>
        </div>
      }
    >
      <PageToolbar
        title="Shade Map"
        description="By season · demonstration placement"
      >
        <Button
          variant="outline"
          disabled={!generated}
          onClick={() => setOpen(true)}
        >
          <Save />
          Save mapping
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setGenerated(false);
            setSelected([]);
          }}
        >
          <RotateCcw />
          Reset
        </Button>
      </PageToolbar>
      <div className="p-5">
        <div className="relative min-h-[560px] rounded-md border bg-card">
          {!generated ? (
            <EmptyState />
          ) : (
            <>
              <div className="absolute inset-x-1/2 top-7 bottom-7 border-l" />
              <div className="absolute inset-y-1/2 right-7 left-7 border-t" />
              <span className="absolute top-3 left-3 text-xs text-muted-foreground">
                Summer · Cool / Light
              </span>
              <span className="absolute top-3 right-3 text-xs text-muted-foreground">
                Spring · Warm / Light
              </span>
              <span className="absolute bottom-3 left-3 text-xs text-muted-foreground">
                Winter · Cool / Deep
              </span>
              <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                Autumn · Warm / Deep
              </span>
              {tableRows
                .filter((row) => selected.includes(row.shade))
                .map((row, index) => (
                  <button
                    type="button"
                    key={row.shade}
                    onClick={() => setActive(row)}
                    title={`${row.brand} · ${row.shade}`}
                    style={{
                      left: `${(row.undertone === "Warm" ? 62 : 22) + (index % 3) * 7}%`,
                      top: `${(row.season === "Winter" ? 65 : 22) + (index % 3) * 9}%`,
                    }}
                    className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded p-1 text-[9px] focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ShadeSwatch
                      hex={row.hex}
                      size="lg"
                      className={
                        active.shade === row.shade
                          ? "ring-2 ring-primary ring-offset-2"
                          : ""
                      }
                    />
                    {row.shade}
                  </button>
                ))}
            </>
          )}
        </div>
        <div className="mt-5 rounded border xl:hidden">{detail}</div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save mapping</DialogTitle>
            <DialogDescription>
              Save this demonstration map to your local mapping library.
            </DialogDescription>
          </DialogHeader>
          <label className="flex flex-col gap-2 py-2 text-xs">
            <span>Mapping name</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Emina Glossy Stain — Full Range"
            />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!name.trim()}
              onClick={() => {
                try {
                  writeMappings([
                    ...readMappings(),
                    {
                      id: crypto.randomUUID(),
                      name: name.trim(),
                      shadeNames: selected,
                      pinned: false,
                      updated: new Date().toISOString(),
                    },
                  ]);
                  toast.success("Mapping saved locally");
                  setOpen(false);
                } catch {
                  toast.error("Unable to save in this browser.");
                }
              }}
            >
              Save mapping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
