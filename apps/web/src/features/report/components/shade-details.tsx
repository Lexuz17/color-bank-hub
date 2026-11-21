import type { Shade } from "@color-bank-hub/contracts/shade";
import { LinkedShades } from "@/components/shared/linked-shades";
import { ShadeSwatch } from "@/components/shared/workspace-components";
import { Badge } from "@/components/ui/badge";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";

const one = (value: number | null) => (value === null ? "—" : String(Number(value.toFixed(1))));
const orDash = (value: string | null) => value ?? "—";

export function ShadeDetails({ shade }: { shade: Shade }) {
  return (
    <section className="rounded-lg bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-medium">Shade details</h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs sm:grid-cols-4">
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Brand</FieldLabel>
          <FieldContent className="font-medium">{shade.brand.name}</FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Product</FieldLabel>
          <FieldContent className="font-medium">{shade.product.name}</FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Format</FieldLabel>
          <FieldContent className="font-medium">{shade.formatItem.name}</FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Shade</FieldLabel>
          <FieldContent className="font-medium">
            <span className="flex items-center gap-2">
              <ShadeSwatch hex={shade.hex} />
              {shade.name}
            </span>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">SKU</FieldLabel>
          <FieldContent className="font-medium">{orDash(shade.sku)}</FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">HEX</FieldLabel>
          <FieldContent className="font-medium">{shade.hex}</FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Undertone</FieldLabel>
          <FieldContent className="font-medium">
            {shade.undertone ? (
              <Badge variant={shade.undertone} className="capitalize">
                {shade.undertone}
              </Badge>
            ) : (
              "—"
            )}
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Season</FieldLabel>
          <FieldContent className="font-medium">
            {shade.season ? (
              <Badge variant={shade.season} className="capitalize">
                {shade.season}
              </Badge>
            ) : (
              "—"
            )}
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Hue Munsell</FieldLabel>
          <FieldContent className="font-medium">{orDash(shade.hueMunsell)}</FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Family</FieldLabel>
          <FieldContent className="font-medium">{orDash(shade.colorFamily)}</FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Value</FieldLabel>
          <FieldContent className="font-medium">{orDash(shade.valueClass)}</FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Chroma</FieldLabel>
          <FieldContent className="font-medium">{orDash(shade.chromaClass)}</FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Hue</FieldLabel>
          <FieldContent className="font-medium">{shade.hslH === null ? "—" : `${one(shade.hslH)}°`}</FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Lightness</FieldLabel>
          <FieldContent className="font-medium">{shade.hslL === null ? "—" : `${one(shade.hslL)}%`}</FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">LCh</FieldLabel>
          <FieldContent className="font-medium">{`${one(shade.lchL)} · ${one(shade.lchC)} · ${one(shade.lchH)}`}</FieldContent>
        </Field>
        <Field>
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Lab</FieldLabel>
          <FieldContent className="font-medium">{`${one(shade.labL)} · ${one(shade.labA)} · ${one(shade.labB)}`}</FieldContent>
        </Field>
        {(shade.lipPhotoUrl || shade.swatchPhotoUrl) && (
          <div className="col-span-full flex flex-wrap gap-3">
            {shade.lipPhotoUrl && <img src={shade.lipPhotoUrl} alt="Shade on lips" className="h-32 rounded-md object-cover" />}
            {shade.swatchPhotoUrl && <img src={shade.swatchPhotoUrl} alt="Shade swatch" className="h-32 rounded-md object-cover" />}
          </div>
        )}
        {shade.ingredientsInci && (
          <Field className="col-span-full">
            <FieldLabel className="text-[11px] font-normal text-muted-foreground">Ingredients</FieldLabel>
            <FieldContent className="leading-relaxed">{shade.ingredientsInci}</FieldContent>
          </Field>
        )}
        {shade.mayContain && (
          <Field className="col-span-full">
            <FieldLabel className="text-[11px] font-normal text-muted-foreground">May contain</FieldLabel>
            <FieldContent className="leading-relaxed">{shade.mayContain}</FieldContent>
          </Field>
        )}
        <Field className="col-span-2">
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Benchmarked to</FieldLabel>
          <FieldContent>
            <LinkedShades shades={shade.benchmarkedTo ?? []} />
          </FieldContent>
        </Field>
        <Field className="col-span-2">
          <FieldLabel className="text-[11px] font-normal text-muted-foreground">Benchmark for</FieldLabel>
          <FieldContent>
            <LinkedShades shades={shade.benchmarkFor ?? []} />
          </FieldContent>
        </Field>
      </div>
    </section>
  );
}
