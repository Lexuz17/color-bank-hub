import { useState } from "react";
import { ImageIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./workspace-components";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ShadeProfile {
  brand: string;
  product: string;
  shade: string;
  hex: string;
  undertone: "Warm" | "Neutral" | "Cool" | null;
  season: "Spring" | "Summer" | "Autumn" | "Winter" | "Neutral" | null;
  format: string;
  /** Extra chips after undertone and season: hue, value, chroma. */
  tags?: string[];
  benchmarkedTo?: string[];
  benchmarkFor?: string[];
  lipPhotoUrl?: string;
  swatchPhotoUrl?: string;
  ingredients?: string;
  mayContain?: string;
  composition?: { name: string; percentage: number }[];
}
export function ProductDetailPanel({ shade }: { shade: ShadeProfile }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="text-[11px]">
      <h2 className="border-b px-4 py-3 text-[10px] font-medium tracking-wide">
        PRODUCT DETAIL
      </h2>
      <section className="space-y-2 border-b p-4">
        <div className="flex items-center justify-between">
          <strong className="font-medium">{shade.brand}</strong>
          <code className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">
            {shade.hex}
          </code>
        </div>
        <p>
          {shade.product} • {shade.shade}
        </p>
        <div className="flex flex-wrap gap-1">
          {shade.undertone && <StatusBadge status={shade.undertone} />}
          {shade.season && <StatusBadge status={shade.season} />}
          {shade.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          {!shade.undertone && !shade.season && !shade.tags?.length && (
            <span className="text-muted-foreground">Not classified</span>
          )}
        </div>
        <p className="text-muted-foreground">{shade.format}</p>
      </section>
      <section className="grid grid-cols-2 gap-2 border-b p-4">
        {shade.lipPhotoUrl ? (
          <img
            src={shade.lipPhotoUrl}
            alt="Shade on lips"
            className="aspect-square w-full rounded-md object-cover"
          />
        ) : (
          <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md bg-muted text-[10px] text-muted-foreground">
            <ImageIcon className="size-5" />
            No lip photo
          </div>
        )}
        {shade.swatchPhotoUrl ? (
          <img
            src={shade.swatchPhotoUrl}
            alt="Shade swatch"
            className="aspect-square w-full rounded-md object-cover"
          />
        ) : (
          // Placeholder: the shade's own color stands in for the swatch photo.
          <div
            role="img"
            aria-label={`Swatch ${shade.hex}`}
            className="aspect-square rounded-md border border-foreground/10"
            style={{ backgroundColor: shade.hex }}
          />
        )}
      </section>
      {(shade.benchmarkedTo?.length || shade.benchmarkFor?.length) && (
        <section className="space-y-2 border-b p-4">
          <h3 className="text-[10px] text-muted-foreground">BENCHMARK</h3>
          <Alert variant="info">
            <Info />
            <AlertDescription>
              {shade.benchmarkedTo?.map((name) => (
                <p key={name}>Benchmarked to: {name}</p>
              ))}
              {shade.benchmarkFor?.map((name) => (
                <p key={name}>Benchmark for: {name}</p>
              ))}
            </AlertDescription>
          </Alert>
        </section>
      )}
      {(shade.ingredients || shade.mayContain) && (
        <section className="space-y-2 border-b p-4">
          <h3 className="text-[10px] text-muted-foreground">INGREDIENTS</h3>
          {shade.ingredients && (
            <>
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
            </>
          )}
          {shade.mayContain && (
            <p className="leading-relaxed">May contain: {shade.mayContain}</p>
          )}
        </section>
      )}
      {!!shade.composition?.length && (
        <section className="space-y-3 p-4">
          <h3 className="text-[10px] text-muted-foreground">
            COLOR COMPOSITION
          </h3>
          {shade.composition.map((item) => (
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
          ))}
          <p className="text-[10px] text-muted-foreground">
            Color composition is only available for own products.
          </p>
        </section>
      )}
    </div>
  );
}
