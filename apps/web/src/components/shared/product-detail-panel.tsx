import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShadeSwatch, StatusBadge } from "./workspace-components";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ShadeProfile {
  brand: string;
  product: string;
  shade: string;
  hex: string;
  undertone: "Warm" | "Neutral" | "Cool";
  season: "Spring" | "Summer" | "Autumn" | "Winter";
  format: string;
  benchmark?: string;
  ingredients: string;
  composition?: { name: string; percentage: number }[];
}
export function ProductDetailPanel({
  shade,
  canViewComposition = false,
}: {
  shade: ShadeProfile;
  canViewComposition?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="text-[11px]">
      <h2 className="border-b px-4 py-3 text-[10px] font-medium tracking-wide">
        PRODUCT DETAIL
      </h2>
      <section className="space-y-3 border-b p-4">
        <div className="flex items-center justify-between">
          <strong className="font-medium">{shade.brand}</strong>
          <code className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">
            {shade.hex}
          </code>
        </div>
        <div className="flex items-center gap-3">
          <ShadeSwatch hex={shade.hex} size="lg" />
          <div>
            <p>{shade.product}</p>
            <p className="mt-1 text-muted-foreground">{shade.shade}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <StatusBadge status={shade.undertone} />
          <StatusBadge status={shade.season} />
        </div>
        <p className="text-muted-foreground">{shade.format}</p>
      </section>
      <section className="space-y-2 border-b p-4">
        <h3 className="text-[10px] text-muted-foreground">BENCHMARK</h3>
        <Alert variant="info">
          <Info />
          <AlertDescription>
            {shade.benchmark ?? "No benchmark assigned"}
          </AlertDescription>
        </Alert>
      </section>
      <section className="space-y-2 border-b p-4">
        <h3 className="text-[10px] text-muted-foreground">INGREDIENTS</h3>
        <p
          className={
            expanded ? "leading-relaxed" : "line-clamp-4 leading-relaxed"
          }
        >
          {shade.ingredients}
        </p>
        <Button
          size="xs"
          variant="link"
          className="h-auto p-0"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Show more"}
        </Button>
      </section>
      <section className="space-y-3 p-4">
        <h3 className="text-[10px] text-muted-foreground">COLOR COMPOSITION</h3>
        {canViewComposition && shade.composition ? (
          shade.composition.map((item) => (
            <div key={item.name}>
              <div className="mb-1 flex justify-between gap-2">
                <span>{item.name}</span>
                <span className="tabular-nums">{item.percentage}%</span>
              </div>
              <div className="h-1 rounded bg-muted">
                <div
                  className="h-full rounded bg-primary"
                  style={{
                    width: `${Math.max(0, Math.min(100, item.percentage))}%`,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="leading-relaxed text-muted-foreground">
            Composition is available for own products to verified R&D and
            administrator accounts.
          </p>
        )}
      </section>
    </div>
  );
}
