import { AlertTriangle, FlaskConical, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  formats: { name: string; count: number }[];
  onBack: () => void;
  onContinue: () => void;
}

export function CrossFormatDialog({ formats, onBack, onContinue }: Props) {
  return (
    <Dialog open onOpenChange={(open) => !open && onBack()}>
      <DialogContent className="max-w-lg space-y-3">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              <AlertTriangle className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-base font-semibold">Cross-format mapping detected</DialogTitle>
              <DialogDescription className="text-xs leading-normal text-muted-foreground">
                You're mixing products from different base types.
                <br />
                The map will still generate, but please read the notes below carefully.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 text-xs">
          <div>
            <p className="mb-1.5 font-medium text-foreground">Formats in this selection:</p>
            <div className="flex flex-wrap gap-2">
              {formats.map((format, index) => (
                <div
                  key={format.name}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium",
                    index % 2 === 0
                      ? "border-pink-200 bg-pink-50/80 text-pink-900 dark:border-pink-900/40 dark:bg-pink-950/40 dark:text-pink-300"
                      : "border-purple-200 bg-purple-50/80 text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/40 dark:text-purple-300",
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  <div>
                    <span>{format.name}</span>
                    <span className="ml-1 text-[10px] opacity-75">({format.count} SKU selected)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
              <FlaskConical className="size-4" />
              Pay attention to base ingredients
            </div>
            <ul className="list-disc space-y-1 pl-4 text-[11px] leading-relaxed opacity-95">
              <li>
                <strong>Powder formulations</strong> — talc-based, dry texture, oil-free. Pigment behavior differs from liquid bases.
              </li>
              <li>
                <strong>Liquid / Cream formulations</strong> — emulsion or oil-based, skin interaction and pigment load are different.
              </li>
              <li>
                Direct color comparisons across these types can be misleading — a shade may appear the same on screen but perform very differently on
                skin.
              </li>
            </ul>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
            <Users className="mt-0.5 size-4 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>Consult R&D before cross-benchmark</strong> — if you plan to use a shade from a different format as a benchmark target, loop in
              the R&D team first to validate the formulation approach.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between pt-2 sm:justify-between">
          <Button type="button" variant="outline" size="sm" onClick={onBack}>
            Go back & review
          </Button>
          <Button type="button" size="sm" className="bg-[#b85444] text-white hover:bg-[#a34738]" onClick={onContinue}>
            I understand - generate anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
