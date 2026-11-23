import { colorMetrics } from "@color-bank-hub/contracts/color";
import { type DataInputIssue, dataInputRow } from "@color-bank-hub/contracts/data-input";
import { useForm, useStore } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { useBrands } from "@/api/brands/brand-queries";
import { useProductFormats } from "@/api/product-formats/product-format-queries";
import { useProducts } from "@/api/products/product-queries";
import { ImageUpload, ShadeSwatch } from "@/components/shared/workspace-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiError } from "@/lib/api-error";
import { uploadFile } from "@/lib/upload";
import { useCommitDataInput, usePreviewDataInput } from "../hooks/data-input-mutations";
import { readComposition } from "../utils/composition";

const defaultValues = {
  brand: "",
  origin: "",
  productName: "",
  subCategoryCode: "",
  shadeName: "",
  sku: "",
  hex: "",
  ingredientsInci: "",
  mayContain: "",
  composition: "",
  benchmarkBrand: "",
  benchmarkProduct: "",
  benchmarkShade: "",
};
type Values = typeof defaultValues;

const originLabels = { own: "Own", external: "External" };
const blank = (text: string) => text.trim() || undefined;
const cardClass = "space-y-4 rounded-lg bg-card p-5 shadow-sm";

// The API names the benchmark as one field; the form has three inputs, so its errors show under the first.
const fieldName = (path: string) => (path === "benchmark" ? "benchmarkBrand" : path);

export function ManualForm() {
  const brands = useBrands();
  const products = useProducts();
  const formats = useProductFormats();
  const preview = usePreviewDataInput();
  const commit = useCommitDataInput();
  // Changing the key empties the two photo pickers after a save.
  const [formKey, setFormKey] = useState(0);
  const [lipPhoto, setLipPhoto] = useState<File | null>(null);
  const [swatchPhoto, setSwatchPhoto] = useState<File | null>(null);
  // Errors the API found in the row, by field name.
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});

  const brandIsKnown = (name: string) => brands.data?.find((brand) => brand.name.toLowerCase() === name.trim().toLowerCase());

  /** The row the API expects. Also returns the problems of cells that cannot be turned into one (e.g. composition text). */
  function toRow(value: Values) {
    const issues: Record<string, string> = {};
    const known = brandIsKnown(value.brand);

    const compositionText = blank(value.composition);
    const composition = compositionText ? readComposition(compositionText) : undefined;
    if (compositionText && !composition) issues.composition = "Write it as name: percent; name: percent";

    const benchmark = { brand: blank(value.benchmarkBrand), product: blank(value.benchmarkProduct), shade: blank(value.benchmarkShade) };
    const benchmarkFilled = Object.values(benchmark).filter(Boolean).length;
    if (benchmarkFilled > 0 && benchmarkFilled < 3) issues.benchmarkBrand = "Fill brand, product and shade together, or leave all empty";

    const row = {
      origin: known ? (known.isOwn ? "own" : "external") : blank(value.origin),
      brand: blank(value.brand),
      productName: blank(value.productName),
      subCategoryCode: blank(value.subCategoryCode),
      shadeName: blank(value.shadeName),
      sku: blank(value.sku),
      hex: blank(value.hex),
      ingredientsInci: blank(value.ingredientsInci),
      mayContain: blank(value.mayContain),
      composition,
      benchmark: benchmarkFilled === 3 ? benchmark : undefined,
    };
    return { row, issues };
  }

  const form = useForm({
    defaultValues,
    validators: {
      // Shape check in the browser with the same schema the API uses; business rules come back from the API.
      onSubmit: ({ value }) => {
        const { row, issues } = toRow(value);
        const result = dataInputRow.safeParse(row);
        const fields: Record<string, string> = { ...issues };
        if (!result.success) {
          for (const zodIssue of result.error.issues) fields[fieldName(String(zodIssue.path[0]))] ??= zodIssue.message;
        }
        return Object.keys(fields).length > 0 ? { fields } : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      const { row } = toRow(value);
      setApiErrors({});
      try {
        const checked = (await preview.mutateAsync({ rows: [row] })).rows[0];
        if (checked.errors.length > 0) {
          setApiErrors(Object.fromEntries(checked.errors.map((error: DataInputIssue) => [fieldName(error.path), error.message])));
          return;
        }
        for (const warning of checked.warnings) toast.info(warning.message);
        // Photos go to storage only now, once the API accepted the row.
        const [lipPhotoKey, swatchPhotoKey] = await Promise.all([
          lipPhoto ? uploadFile(lipPhoto, "shade-photo") : undefined,
          swatchPhoto ? uploadFile(swatchPhoto, "shade-photo") : undefined,
        ]);
        await commit.mutateAsync({ rows: [{ ...row, lipPhotoKey, swatchPhotoKey }] });
        clear();
      } catch (error) {
        // The mutations already show their own error toast; only the photo upload needs one here.
        if (!preview.isError && !commit.isError) toast.error(apiError(error));
      }
    },
  });

  function clear() {
    form.reset();
    setApiErrors({});
    setLipPhoto(null);
    setSwatchPhoto(null);
    setFormKey((key) => key + 1);
  }

  const { brand, hex, productName } = useStore(form.store, (state) => state.values);
  const knownBrand = brandIsKnown(brand);
  const brandProducts = (products.data ?? []).filter((product) => !knownBrand || product.brandId === knownBrand.id);
  const color = /^#[\da-fA-F]{6}$/.test(hex.trim()) ? colorMetrics(hex.trim()) : null;
  const autoFields = [
    ["HSL: Hue", color?.hslH],
    ["HSL: Saturation", color?.hslS],
    ["HSL: Lightness", color?.hslL],
    ["LCh: Lightness", color?.lchL],
    ["LCh: Chroma", color?.lchC],
    ["LCh: Hue", color?.lchH],
  ] as const;
  const isBusy = preview.isPending || commit.isPending;

  const message = (name: string, field: { state: { meta: { errors: unknown[] } } }) => {
    const local = field.state.meta.errors[0];
    return apiErrors[name] ?? (local ? String(local) : undefined);
  };
  const text = (name: keyof Values, label: string, options: { required?: boolean; placeholder?: string; list?: string } = {}) => (
    <form.Field name={name}>
      {(field) => (
        <label className="grid gap-1.5 text-xs font-medium">
          <span>
            {label}
            {options.required && <span className="text-destructive"> *</span>}
          </span>
          <Input
            value={field.state.value}
            list={options.list}
            placeholder={options.placeholder}
            maxLength={255}
            aria-invalid={!!message(name, field)}
            onChange={(event) => field.handleChange(event.target.value)}
          />
          {message(name, field) && <span className="text-[11px] font-normal text-destructive">{message(name, field)}</span>}
        </label>
      )}
    </form.Field>
  );
  const longText = (name: keyof Values, label: string, options: { required?: boolean; placeholder?: string } = {}) => (
    <form.Field name={name}>
      {(field) => (
        <label className="grid gap-1.5 text-xs font-medium">
          <span>
            {label}
            {options.required && <span className="text-destructive"> *</span>}
          </span>
          <Textarea
            rows={3}
            maxLength={20000}
            value={field.state.value}
            placeholder={options.placeholder}
            aria-invalid={!!message(name, field)}
            onChange={(event) => field.handleChange(event.target.value)}
          />
          {message(name, field) && <span className="text-[11px] font-normal text-destructive">{message(name, field)}</span>}
        </label>
      )}
    </form.Field>
  );

  return (
    <form
      className="space-y-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <section className={cardClass}>
        <h2 className="text-sm font-medium">Basic info</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {text("brand", "Brand", { required: true, placeholder: "e.g. Emina", list: "manual-brands" })}
          <form.Field name="origin">
            {(field) => (
              <div className="grid gap-1.5 text-xs font-medium">
                <span>
                  Origin<span className="text-destructive"> *</span>
                </span>
                {/* A brand that exists already has its origin; a new brand needs one. */}
                <Select
                  value={(knownBrand ? (knownBrand.isOwn ? "own" : "external") : field.state.value) || null}
                  disabled={!!knownBrand}
                  onValueChange={(value) => value && field.handleChange(value)}
                >
                  <SelectTrigger aria-label="Origin" className="w-full">
                    <SelectValue placeholder="Own or external">
                      {(value: keyof typeof originLabels | null) => (value ? originLabels[value] : null)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="own">Own</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
                {message("origin", field) && <span className="text-[11px] font-normal text-destructive">{message("origin", field)}</span>}
              </div>
            )}
          </form.Field>
          <form.Field name="subCategoryCode">
            {(field) => (
              <div className="grid gap-1.5 text-xs font-medium">
                <span>
                  Sub-category<span className="text-destructive"> *</span>
                </span>
                <Select value={field.state.value || null} onValueChange={(value) => value && field.handleChange(value)}>
                  <SelectTrigger aria-label="Sub-category" className="w-full">
                    <SelectValue placeholder="Select sub-category">
                      {(value: string | null) => {
                        const item = formats.data?.flatMap((format) => format.items).find((entry) => entry.code === value);
                        return item ? `${item.name} (${item.code})` : null;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {formats.data?.flatMap((format) =>
                      format.items.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {format.name} · {item.name} ({item.code})
                        </SelectItem>
                      )),
                    )}
                  </SelectContent>
                </Select>
                {message("subCategoryCode", field) && (
                  <span className="text-[11px] font-normal text-destructive">{message("subCategoryCode", field)}</span>
                )}
              </div>
            )}
          </form.Field>
          {text("productName", "Product name", { required: true, placeholder: "e.g. Jelly Stain", list: "manual-products" })}
          {text("shadeName", "Shade name", { required: true, placeholder: "e.g. 01 Autumn Bell" })}
          {text("sku", "SKU", { placeholder: "e.g. EM-JS-08" })}
        </div>
        <datalist id="manual-brands">
          {brands.data?.map((item) => (
            <option key={item.id} value={item.name} />
          ))}
        </datalist>
        <datalist id="manual-products">
          {brandProducts.map((item) => (
            <option key={item.id} value={item.name} />
          ))}
        </datalist>
        <div className="grid gap-4 md:grid-cols-2" key={formKey}>
          <ImageUpload label="Photo on lips" onFileChange={setLipPhoto} />
          <ImageUpload label="Photo of swatch" onFileChange={setSwatchPhoto} />
        </div>
        {productName &&
          knownBrand &&
          !products.data?.some((item) => item.brandId === knownBrand.id && item.name.toLowerCase() === productName.trim().toLowerCase()) && (
            <p className="text-[11px] text-muted-foreground">This product is new for {knownBrand.name} and will be created.</p>
          )}
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Color input</h2>
          <p className="text-[11px] text-muted-foreground">Enter the HEX code and everything else is calculated.</p>
        </div>
        <form.Field name="hex">
          {(field) => (
            <label className="grid gap-1.5 text-xs font-medium">
              <span>
                HEX code<span className="text-destructive"> *</span>
              </span>
              <span className="flex items-center gap-3">
                <Input
                  value={field.state.value}
                  placeholder="e.g. #fc8477"
                  aria-invalid={!!message("hex", field)}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                {color && <ShadeSwatch hex={hex.trim()} />}
              </span>
              {message("hex", field) && <span className="text-[11px] font-normal text-destructive">{message("hex", field)}</span>}
            </label>
          )}
        </form.Field>
        <div className="grid gap-3 sm:grid-cols-3">
          {autoFields.map(([label, value]) => (
            <label key={label} className="grid gap-1.5 text-xs font-medium">
              {label} <span className="font-normal text-muted-foreground">auto</span>
              <Input readOnly value={value ?? "—"} className="bg-success/40" />
            </label>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Undertone, season, family, chroma and value are set from the sub-category's classification config when the shade is saved.
        </p>
      </section>

      <section className={cardClass}>
        <h2 className="text-sm font-medium">References &amp; ingredients</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium">Benchmark reference</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {text("benchmarkBrand", "Brand", { placeholder: "e.g. Dinto", list: "manual-brands" })}
              {text("benchmarkProduct", "Product", { placeholder: "e.g. Blur-Glowy Tint" })}
              {text("benchmarkShade", "Shade", { placeholder: "e.g. 204 Modestia" })}
            </div>
          </div>
          {longText("composition", "Color composition (own brands)", { placeholder: "e.g. Red 7008: 29.7; Orange 205: 23.7" })}
          {longText("ingredientsInci", "Full ingredients", { required: true, placeholder: "e.g. Isododecane, Dimethicone, …" })}
          {longText("mayContain", "May contain", { placeholder: "e.g. CI 77891, CI 16035" })}
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={isBusy} onClick={clear}>
          Clear form
        </Button>
        <Button type="submit" disabled={isBusy}>
          {isBusy ? "Adding shade…" : "+ Add shade"}
        </Button>
      </div>
    </form>
  );
}
