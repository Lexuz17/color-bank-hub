import type { ProductFormat } from "@color-bank-hub/contracts/catalog";
import { munsellHues } from "@color-bank-hub/contracts/color-classification";
import { season as seasonEnum } from "@color-bank-hub/contracts/common";
import type { Shade, ShadeParams } from "@color-bank-hub/contracts/shade";
import { Lock } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { useBrands } from "@/api/brands/brand-queries";
import { useProducts } from "@/api/products/product-queries";
import { useShades } from "@/api/shades/shade-queries";
import { SearchInput, ShadeSwatch } from "@/components/shared/workspace-components";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { MappingSteps } from "./mapping-steps";
import { SearchSelect } from "@/components/shared/search-select";

const ALL = "all";
const noFilters = {
  search: "",
  brandId: ALL,
  productId: ALL,
  season: ALL,
  hueMunsell: ALL,
};
// API max page size. shortcut: no paging in the list; users narrow it with filters.
const LIST_LIMIT = 100;

const capitalize = (text: string) => text[0].toUpperCase() + text.slice(1);

interface Props {
  formats: ProductFormat[];
  categoryId: number | null;
  itemId: number | null;
  onCategoryChange: (id: number) => void;
  onItemChange: (id: number) => void;
  selected: Map<string, Shade>;
  onSelectedChange: (selected: Map<string, Shade>) => void;
  generated: boolean;
  onGenerate: () => void;
  activeId: string | null;
  onOpenShade: (shade: Shade) => void;
}

export function MappingSidebar(props: Props) {
  const { formats, categoryId, itemId, selected, generated } = props;
  const category = formats.find((format) => format.id === categoryId);
  const item = category?.items.find((entry) => entry.id === itemId);
  // Step 1 is locked once SKUs are picked: a map holds one sub-category only.
  const locked = selected.size > 0;

  return (
    <div className="flex h-full flex-col">
      <MappingSteps active={!item ? 0 : generated ? 2 : 1} />

      <section className="space-y-2 border-b p-3">
        <h2 className="text-[11px] font-medium text-muted-foreground">PRODUCT FORMAT</h2>
        <div className="grid grid-cols-2 gap-2">
          <SearchSelect
            value={categoryId === null ? null : String(categoryId)}
            placeholder="Category"
            disabled={locked}
            options={formats.map((format) => [String(format.id), format.name])}
            onChange={(value) => props.onCategoryChange(Number(value))}
          />
          <SearchSelect
            value={itemId === null ? null : String(itemId)}
            placeholder="Sub-category"
            disabled={locked || !category}
            options={(category?.items ?? []).map((entry) => [String(entry.id), `${entry.name} (${entry.count})`])}
            onChange={(value) => props.onItemChange(Number(value))}
          />
        </div>
        <p className="flex gap-1.5 rounded border border-primary/30 bg-accent p-2 text-[10px] text-primary">
          <Lock className="mt-0.5 size-3 shrink-0" />
          {locked && category && item
            ? `Locked to ${category.name} – ${item.name}. Clear selection to switch.`
            : "Select the category and sub-category for mapping."}
        </p>
      </section>

      <SkuList key={item?.id ?? "none"} {...props} productFormatItemId={item?.id ?? null} />

      <div className="flex items-center gap-3 border-t p-3">
        <span className="flex-1 text-[11px] text-muted-foreground">
          {selected.size} selected{category ? ` • ${category.name}` : ""}
        </span>
        <Button disabled={selected.size === 0} onClick={props.onGenerate}>
          Generate
        </Button>
      </div>
    </div>
  );
}

function SkuList({ productFormatItemId, selected, onSelectedChange, activeId, onOpenShade }: Props & { productFormatItemId: number | null }) {
  const ready = productFormatItemId !== null;
  const [filters, setFilters] = useState(noFilters);
  const search = useDeferredValue(filters.search.trim());
  const pick = (value: string) => (value === ALL ? undefined : value);
  const params: ShadeParams = {
    productFormatItemId: productFormatItemId ?? undefined,
    search: search || undefined,
    brandId: pick(filters.brandId),
    productId: pick(filters.productId),
    season: pick(filters.season) as ShadeParams["season"],
    hueMunsell: pick(filters.hueMunsell),
    pageSize: LIST_LIMIT,
  };
  const shades = useShades(params, ready);
  const brands = useBrands();
  const products = useProducts();
  const items = shades.data?.items ?? [];
  const total = shades.data?.pagination.total ?? 0;
  const set = (patch: Partial<typeof noFilters>) => setFilters({ ...filters, ...patch });

  // Products of this sub-category, narrowed by the brand filter.
  const productOptions = (products.data ?? []).filter(
    (product) => product.productFormatItemId === productFormatItemId && (filters.brandId === ALL || product.brandId === filters.brandId),
  );

  function toggle(shade: Shade, checked: boolean) {
    const next = new Map(selected);
    if (checked) next.set(shade.id, shade);
    else next.delete(shade.id);
    onSelectedChange(next);
  }

  function selectAll() {
    const next = new Map(selected);
    for (const shade of items) next.set(shade.id, shade);
    onSelectedChange(next);
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-2 border-b p-3">
        <h2 className="text-[11px] font-medium text-muted-foreground">SKUs</h2>
        <SearchInput value={filters.search} onValueChange={(value) => set({ search: value })} />
        <FilterSelect
          label="Brand"
          disabled={!ready}
          value={filters.brandId}
          // A product belongs to one brand, so a new brand clears the product filter.
          onChange={(brandId) => set({ brandId, productId: ALL })}
          options={(brands.data ?? []).map((brand) => [brand.id, brand.name])}
        />
        <FilterSelect
          label="Products"
          disabled={!ready}
          value={filters.productId}
          onChange={(productId) => set({ productId })}
          options={productOptions.map((product) => [product.id, product.name])}
        />
        <div className="grid grid-cols-2 gap-2">
          <FilterSelect
            label="Season"
            disabled={!ready}
            value={filters.season}
            onChange={(season) => set({ season })}
            options={seasonEnum.options.map((value) => [value, capitalize(value)])}
          />
          <FilterSelect
            label="Hue"
            disabled={!ready}
            value={filters.hueMunsell}
            onChange={(hueMunsell) => set({ hueMunsell })}
            // shortcut: every Munsell area is listed; read the used ones from the active config once an endpoint exists.
            options={Object.entries(munsellHues)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-1.5 text-[11px]">
        <span className="flex-1">
          Showing <b>{items.length}</b> of {total}
        </span>
        <Button size="xs" variant="outline" disabled={!items.length} onClick={selectAll}>
          Select all
        </Button>
        <Button size="xs" variant="outline" disabled={!selected.size} onClick={() => onSelectedChange(new Map())}>
          Clear
        </Button>
      </div>
      {total > items.length && (
        <p className="border-b px-3 py-1.5 text-[10px] text-muted-foreground">
          Only the first {LIST_LIMIT} are listed. Narrow the filters to see the rest.
        </p>
      )}

      <ul className="min-h-0 flex-1 overflow-y-auto">
        {ready && shades.isPending && <li className="p-3 text-[11px] text-muted-foreground">Loading SKUs…</li>}
        {shades.isError && <li className="p-3 text-[11px] text-destructive">Could not load SKUs. Try again.</li>}
        {shades.isSuccess && !items.length && <li className="p-3 text-[11px] text-muted-foreground">No SKUs match these filters.</li>}
        {items.map((shade) => (
          <li
            key={shade.id}
            className="flex items-center border-b border-l-2 border-l-transparent text-[11px] has-data-checked:border-l-primary has-data-checked:bg-accent"
          >
            <label htmlFor={`sku-${shade.id}`} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-2 pr-2 pl-3">
              <ShadeSwatch hex={shade.hex} />
              <span className="min-w-0 flex-1">
                <button
                  type="button"
                  className={cn("block max-w-full truncate text-left hover:underline", shade.id === activeId && "font-medium text-primary")}
                  onClick={() => onOpenShade(shade)}
                >
                  {shade.name}
                </button>
                <span className="block truncate text-[10px] text-muted-foreground">
                  {[
                    shade.brand.name,
                    shade.product.name,
                    shade.season && capitalize(shade.season),
                    shade.hueMunsell && (munsellHues[shade.hueMunsell] ?? shade.hueMunsell),
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </span>
              </span>
            </label>

            <Checkbox
              id={`sku-${shade.id}`}
              className="mr-3"
              aria-label={`Select ${shade.name}`}
              checked={selected.has(shade.id)}
              onCheckedChange={(checked) => toggle(shade, checked)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [value: string, label: string][];
  disabled: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
      <span aria-hidden="true" className="w-12 shrink-0">
        {label}
      </span>
      <SearchSelect
        value={value}
        placeholder="All"
        disabled={disabled}
        className="flex-1 text-foreground"
        options={[[ALL, "All"], ...options]}
        onChange={onChange}
      />
    </div>
  );
}
