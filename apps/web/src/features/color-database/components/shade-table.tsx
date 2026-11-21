import type { Shade } from "@color-bank-hub/contracts/shade";
import { ShadeSwatch, StatusBadge } from "@/components/shared/workspace-components";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
            <TableHead>LCh + Lab</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shades.map((shade) => {
            const isSelected = selected.has(shade.id);
            const benchmarkedTo = shade.benchmarkedTo ?? [];
            const benchmarkFor = shade.benchmarkFor ?? [];
            return (
              <TableRow key={shade.id} aria-selected={isSelected} className={isSelected ? "bg-accent hover:bg-accent" : undefined}>
                <TableCell className="w-10 px-3 text-center">
                  <Checkbox checked={isSelected} onCheckedChange={(checked) => onToggle(shade, !!checked)} aria-label={`Select ${shade.name}`} />
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
                <TableCell>
                  <p>
                    LCh {one(shade.lchL)} · {one(shade.lchC)} · {one(shade.lchH)}
                  </p>
                  <p className="text-muted-foreground">
                    Lab {one(shade.labL)} · {one(shade.labA)} · {one(shade.labB)}
                  </p>
                </TableCell>
              </TableRow>
            );
          })}
          {shades.length === 0 && (
            <TableRow>
              <TableCell colSpan={showFormat ? 17 : 16} className="h-32 text-center text-muted-foreground">
                No shades match.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
