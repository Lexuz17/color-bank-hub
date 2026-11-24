import type { Shade } from "@color-bank-hub/contracts/shade";
import { useRef } from "react";
import { ShadeSwatch, StatusBadge } from "@/components/shared/workspace-components";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LinkedShades } from "@/components/shared/linked-shades";

interface Props {
  shades: Shade[];
  selected: Map<string, Shade>;

  // Show the sub-category when rows of several formats are mixed.
  showFormat: boolean;
  onToggle: (shade: Shade, checked: boolean) => void;
  onToggleAll: (shades: Shade[], checked: boolean) => void;
}

const seasonLabels = { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter", neutral: "Neutral" } as const;
const toneLabels = { warm: "Warm", neutral: "Neutral", cool: "Cool" } as const;

const one = (value: number | null) => (value === null ? "—" : String(Number(value.toFixed(1))));

export function ShadeTable({ shades, selected, showFormat, onToggle, onToggleAll }: Props) {
  const lastPicked = useRef<number | null>(null);

  function pick(index: number, shade: Shade, event: Event) {
    const checked = !selected.has(shade.id);
    const from = lastPicked.current;
    if ((event as MouseEvent).shiftKey && from !== null && from < shades.length) {
      onToggleAll(shades.slice(Math.min(from, index), Math.max(from, index) + 1), checked);
    } else {
      onToggle(shade, checked);
    }
    lastPicked.current = index;
  }

  return (
    <div className="border-b bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 px-3 text-center">
              <Checkbox
                checked={shades.length > 0 && shades.every((shade) => selected.has(shade.id))}
                onCheckedChange={(checked) => onToggleAll(shades, !!checked)}
                aria-label="Select all shades on this page"
              />
            </TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Product name</TableHead>
            {showFormat && <TableHead>Format</TableHead>}
            <TableHead>Shade name</TableHead>
            <TableHead>Undertone</TableHead>
            <TableHead>Season</TableHead>
            <TableHead>Hue Munsell</TableHead>
            <TableHead>Family</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Chroma</TableHead>
            <TableHead>Flag</TableHead>
            <TableHead>Hue</TableHead>
            <TableHead>Lightness</TableHead>
            <TableHead>Benchmark for</TableHead>
            <TableHead>Benchmarked to</TableHead>
            <TableHead>L</TableHead>
            <TableHead>C</TableHead>
            <TableHead>h</TableHead>
            <TableHead>a</TableHead>
            <TableHead>b</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shades.map((shade, index) => {
            const isSelected = selected.has(shade.id);
            const benchmarkedTo = shade.benchmarkedTo ?? [];
            const benchmarkFor = shade.benchmarkFor ?? [];
            return (
              <TableRow
                key={shade.id}
                aria-selected={isSelected}
                className={cn("cursor-pointer", isSelected && "bg-accent hover:bg-accent")}
                // Shift + click would select text; links, buttons and the checkbox keep their own click.
                onMouseDown={(event) => event.shiftKey && event.preventDefault()}
                onClick={(event) => {
                  if (!(event.target as HTMLElement).closest("a, button, [role=checkbox]")) pick(index, shade, event.nativeEvent);
                }}
              >
                <TableCell className="w-10 px-3 text-center">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(_, details) => pick(index, shade, details.event)}
                    aria-label={`Select ${shade.name}`}
                  />
                </TableCell>
                <TableCell>{shade.brand.name}</TableCell>
                <TableCell>{shade.product.name}</TableCell>
                {showFormat && <TableCell>{shade.formatItem.name}</TableCell>}
                <TableCell>
                  <span className="flex items-center gap-2">
                    <ShadeSwatch hex={shade.hex} />
                    {shade.name}
                  </span>
                </TableCell>
                <TableCell>{shade.undertone ? <StatusBadge status={toneLabels[shade.undertone]} /> : "—"}</TableCell>
                <TableCell>{shade.season ? <StatusBadge status={seasonLabels[shade.season]} /> : "—"}</TableCell>
                <TableCell>{shade.hueMunsell ?? "—"}</TableCell>
                <TableCell>{shade.colorFamily ?? "—"}</TableCell>
                <TableCell>{shade.valueClass ?? "—"}</TableCell>
                <TableCell>{shade.chromaClass ?? "—"}</TableCell>
                <TableCell>{benchmarkedTo.length + benchmarkFor.length > 0 && <Badge variant="warning">benchmarked</Badge>}</TableCell>
                <TableCell>{shade.hslH === null ? "—" : `${one(shade.hslH)}°`}</TableCell>
                <TableCell>{shade.hslL === null ? "—" : `${one(shade.hslL)}%`}</TableCell>
                <TableCell>
                  <LinkedShades shades={benchmarkFor} />
                </TableCell>
                <TableCell>
                  <LinkedShades shades={benchmarkedTo} />
                </TableCell>
                {/* L* is the same in LCh and Lab, so it shows once. */}
                <TableCell>{one(shade.lchL)}</TableCell>
                <TableCell>{one(shade.lchC)}</TableCell>
                <TableCell>{one(shade.lchH)}</TableCell>
                <TableCell>{one(shade.labA)}</TableCell>
                <TableCell>{one(shade.labB)}</TableCell>
              </TableRow>
            );
          })}
          {shades.length === 0 && (
            <TableRow>
              <TableCell colSpan={showFormat ? 21 : 20} className="h-32 text-center text-muted-foreground">
                No shades match.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
