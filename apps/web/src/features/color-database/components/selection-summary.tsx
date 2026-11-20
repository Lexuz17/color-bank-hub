import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  count: number;
  label: string;
  onClear: () => void;
  onMap: () => void;
}

export function SelectionSummary({ count, label, onClear, onMap }: Props) {
  return (
    <div className="shrink-0 space-y-3 border-t bg-card p-3 text-[11px]">
      <div className="flex items-start gap-2 rounded-lg border bg-muted/50 p-2.5 leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        <p>
          <strong className="font-semibold text-foreground">Benchmark rule:</strong> benchmarks can only be set within the same parent format and
          finish (e.g. Lip Matte Cream ↔ Lip Matte Cream and Matte Lipstick only).
        </p>
      </div>
      {count > 0 && (
        <div className="space-y-2 rounded-lg border border-primary/20 bg-accent p-2.5">
          <p className="font-semibold text-primary">
            {count} {count === 1 ? "shade" : "shades"} selected from {label}
          </p>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="flex-1" onClick={onClear}>
              Clear
            </Button>
            <Button size="sm" className="flex-1" onClick={onMap}>
              Map selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
