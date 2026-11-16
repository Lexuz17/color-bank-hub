import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { PageShell } from "@/components/layout/page-shell";
import { PageToolbar, ShadeSwatch, LoadingState } from "@/components/shared/workspace-components";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { ApiError } from "@/components/shared/request-feedback";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CatalogSetup } from "@/components/catalog/catalog-setup";
import { ShadeDatabase } from "@/components/shades/shade-database";
import { useCatalog } from "@/features/data-input/hooks/catalog-queries";
import { useCommitImport, useCreateShade, usePreviewImport } from "@/features/data-input/hooks/data-input-mutations";
import { parseDelimitedText, parseTemplateRows, parseXlsxBuffer } from "@/features/data-input/utils/template-parser";
import { colorMetrics } from "@color-bank-hub/contracts/color";
import type { ShadeInput } from "@color-bank-hub/contracts/shade";
export function DataInputPage() {
  const [tab, setTab] = useState("manual");
  const [productId, setProductId] = useState("");
  const [hex, setHex] = useState("#aa6d78");
  const [paste, setPaste] = useState("");
  const [snapshot, setSnapshot] = useState<ShadeInput[]>([]);
  const [parseError, setParseError] = useState("");
  const catalog = useCatalog();
  const create = useCreateShade();
  const preview = usePreviewImport();
  const commit = useCommitImport();
  const busy = preview.isPending || commit.isPending;
  function clearPreview() {
    setSnapshot([]);
    preview.reset();
    commit.reset();
    setParseError("");
  }
  function changeProduct(value: string) {
    setProductId(value);
    clearPreview();
    create.reset();
  }
  const productLabel = (id: string) => {
    const item = catalog.products.data?.find((entry) => entry.id === id);
    if (!item) return "Select a product";
    const brand = catalog.brands.data?.find((entry) => entry.id === item.brandId);
    return `${brand?.name ?? "Brand"} · ${item.name}`;
  };
  const productSelect = (
    <div className="grid gap-2 text-xs">
      Product
      <Select
        value={productId || null}
        onValueChange={(value) => value && changeProduct(value)}
        disabled={catalog.products.isPending || catalog.products.isError || busy}
      >
        <SelectTrigger aria-label="Product" className="w-full">
          <SelectValue>{(value: string | null) => productLabel(value ?? "")}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {catalog.products.data?.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {productLabel(item.id)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
  const color = /^#[0-9a-f]{6}$/i.test(hex) ? colorMetrics(hex) : null;
  // Labels (undertone, season, family, chroma, value) come from the category's
  // classification config, which the API applies on save.
  const autoFields = [
    ["HSL: Hue", color?.hslH],
    ["HSL: Saturation", color?.hslS],
    ["HSL: Lightness", color?.hslL],
    ["LCh: Lightness", color?.lchL],
    ["LCh: Chroma", color?.lchC],
    ["LCh: Hue", color?.lchH],
  ] as const;
  return (
    <PageShell section="Data Input">
      <PageToolbar title="Data Input" description="Add, import, and update shade data" />
      <div className="space-y-4 p-5">
        <CatalogSetup onProductCreated={changeProduct} />
        {catalog.products.isPending && <LoadingState label="Loading product catalog…" />}
        {catalog.products.isError && <ApiError error={catalog.products.error} retry={() => void catalog.products.refetch()} />}{" "}
        {catalog.brands.isError && <ApiError error={catalog.brands.error} retry={() => void catalog.brands.refetch()} />}{" "}
        {catalog.formats.isError && <ApiError error={catalog.formats.error} retry={() => void catalog.formats.refetch()} />}{" "}
        {catalog.products.data?.length === 0 && (
          <p className="text-xs text-muted-foreground">Create a format, then a brand and product to start adding shades.</p>
        )}
        <Tabs
          value={tab}
          onValueChange={(value) => {
            if (value && !busy) setTab(value);
          }}
        >
          <div className="overflow-x-auto border-b">
            <TabsList variant="line" className="h-10! w-max justify-start gap-1 rounded-none p-0">
              {[
                { value: "paste", label: "Paste from Excel" },
                { value: "upload", label: "File Upload" },
                { value: "manual", label: "Manual Entry" },
                { value: "manage", label: "Manage Database" },
              ].map((item) => (
                <TabsTrigger key={item.value} value={item.value} disabled={busy} className="h-10 flex-none px-4 after:bottom-0!">
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value="manual">
            <form
              className="mt-4 w-full space-y-5 rounded-md border bg-card p-5"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const data = new FormData(form);
                const body: ShadeInput = {
                  productId,
                  sku: String(data.get("sku")).trim() || undefined,
                  name: String(data.get("name")).trim(),
                  hex: hex.trim(),
                  ingredientsInci: String(data.get("ingredients")).trim() || undefined,
                };
                create.mutate(body, {
                  onSuccess: () => {
                    form.reset();
                    setHex("#aa6d78");
                  },
                });
              }}
            >
              <h2 className="text-sm font-medium">Basic information</h2>
              {productSelect}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-xs">
                  Shade name
                  <Input name="name" required maxLength={255} />
                </label>
                <label className="grid gap-2 text-xs">
                  SKU
                  <Input name="sku" maxLength={255} />
                </label>
              </div>
              <h2 className="text-sm font-medium">Color input</h2>
              <label className="grid gap-2 text-xs">
                HEX code
                <div className="flex items-center gap-3">
                  <Input
                    value={hex}
                    onChange={(event) => setHex(event.target.value)}
                    pattern="#[0-9a-fA-F]{6}"
                    title="Enter a six-digit HEX code"
                    required
                  />
                  <ShadeSwatch hex={hex} />
                </div>
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {autoFields.map(([label, value]) => (
                  <label key={label} className="grid gap-2 text-xs">
                    {label} (auto)
                    <Input readOnly value={value ?? "—"} />
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Undertone, season, family, chroma and value are set from the category's classification config when the shade is saved.
              </p>
              {/* shortcut: photo upload (uploadFile in lib/upload.ts, purpose "shade-photo") is left to the Data Input module. */}
              <label className="grid gap-2 text-xs">
                Full ingredients
                <Textarea name="ingredients" maxLength={20000} />
              </label>
              {create.isError && <ApiError error={create.error} />}
              <Button type="submit" disabled={!productId || create.isPending || catalog.products.isError}>
                {create.isPending ? "Adding shade…" : "+ Add shade"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="paste">
            <div className="mt-4 w-full space-y-4 rounded-md border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-medium">Paste from Excel</h2>
                <a
                  href="/templates/shade-import-template.xlsx"
                  download
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
                >
                  <Download className="size-3.5" />
                  Download template (.xlsx)
                </a>
              </div>
              {productSelect}
              <p className="text-xs text-muted-foreground">
                Paste tab-separated columns copied from the template or 3 columns (SKU, shade name, HEX). If rows specify a known product name, it
                will be automatically linked; otherwise, shades are assigned to the selected product above.
              </p>
              <Textarea
                aria-label="Spreadsheet data"
                rows={7}
                value={paste}
                disabled={busy}
                onChange={(event) => {
                  setPaste(event.target.value);
                  clearPreview();
                }}
                placeholder={
                  "Origin\tBrand\tProduct Name\tSub-Category Code\tShade Name\tSKU\tHEX Code\nOwn\tEmina\tJelly Stain\tTG\t08 Ube Mochi\tEM-JS-08\t#aa6d78"
                }
              />
              {parseError && (
                <p role="alert" className="text-xs text-destructive">
                  {parseError}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!paste.trim() || busy}
                  onClick={() => {
                    clearPreview();
                    const rawRows = parseDelimitedText(paste);
                    const parsed = parseTemplateRows(rawRows, catalog.products.data ?? [], productId);

                    if (parsed.error) {
                      setParseError(parsed.error);
                      return;
                    }
                    if (!parsed.rows.length) {
                      setParseError("No valid rows found in pasted data.");
                      return;
                    }
                    if (parsed.rows.length > 500) {
                      setParseError("Enter 1–500 rows max.");
                      return;
                    }
                    if (parsed.unassignedProductsCount > 0 && !productId) {
                      setParseError("Select a target product above for shades that do not specify an existing product.");
                      return;
                    }

                    const rows = parsed.rows;
                    if (new Blob([JSON.stringify({ rows })]).size > 2 * 1024 * 1024) {
                      setParseError("Import request exceeds the 2 MB limit.");
                      return;
                    }
                    setParseError("");
                    preview.mutate(rows, {
                      onSuccess: () => setSnapshot(rows),
                    });
                  }}
                >
                  {preview.isPending ? "Validating…" : "Preview & validate"}
                </Button>
                <Button
                  variant="outline"
                  disabled={!preview.data?.valid || !snapshot.length || busy}
                  onClick={() =>
                    commit.mutate(snapshot, {
                      onSuccess: () => {
                        setPaste("");
                        setSnapshot([]);
                        preview.reset();
                      },
                    })
                  }
                >
                  {commit.isPending ? "Importing…" : "Import validated rows"}
                </Button>
              </div>
              {preview.isError && <ApiError error={preview.error} />} {commit.isError && <ApiError error={commit.error} />}{" "}
              {preview.data && (
                <>
                  <p className="text-xs text-muted-foreground">
                    {preview.data.validCount} of {preview.data.rowCount} rows valid
                  </p>
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          {["Row", "SKU", "Shade", "HEX", "Validation"].map((name) => (
                            <th key={name} className="border-b bg-muted p-2 text-left font-medium">
                              {name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.data.rows.map((row) => (
                          <tr key={row.row}>
                            <td className="border-b p-2">{row.row}</td>
                            <td className="border-b p-2">{snapshot[row.row - 1]?.sku ?? "—"}</td>
                            <td className="border-b p-2">{snapshot[row.row - 1]?.name ?? "—"}</td>
                            <td className="border-b p-2">
                              <span className="flex items-center gap-1.5">
                                <span className="size-3 rounded-full border shrink-0" style={{ backgroundColor: snapshot[row.row - 1]?.hex }} />
                                {snapshot[row.row - 1]?.hex ?? "—"}
                              </span>
                            </td>
                            <td className={`border-b p-2 ${row.valid ? "text-success-foreground" : "text-destructive"}`}>
                              {row.valid ? "Valid" : row.errors.map((error) => `${error.path ? `${error.path}: ` : ""}${error.message}`).join("; ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent value="upload">
            <div className="mt-4 flex min-h-64 w-full flex-col items-center justify-center gap-4 rounded-md border border-dashed bg-card p-8 text-center">
              <h2 className="text-sm font-medium">Upload import template (.xlsx, .tsv, .csv)</h2>
              <p className="max-w-lg text-xs text-muted-foreground">
                Upload your filled shade import Excel template (.xlsx), or a TSV/CSV file. The file will be parsed and loaded into the import preview.
              </p>
              <a href="/templates/shade-import-template.xlsx" download className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}>
                <Download className="size-3.5" />
                Download template (.xlsx)
              </a>
              <Input
                className="max-w-md"
                aria-label="Upload shade import file"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.tsv,text/tab-separated-values,.csv,text/csv"
                onChange={async (event) => {
                  const input = event.currentTarget;
                  const file = input.files?.[0];
                  if (!file) return;

                  const lowerName = file.name.toLowerCase();
                  const isXlsx = lowerName.endsWith(".xlsx");
                  const isTsv = lowerName.endsWith(".tsv") || lowerName.endsWith(".txt");
                  const isCsv = lowerName.endsWith(".csv");

                  if (!isXlsx && !isTsv && !isCsv) {
                    toast.error("Choose an .xlsx, .tsv, or .csv file");
                    input.value = "";
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("Choose a file under 5 MB");
                    input.value = "";
                    return;
                  }

                  try {
                    let matrix: string[][];
                    if (isXlsx) {
                      const buffer = await file.arrayBuffer();
                      matrix = await parseXlsxBuffer(buffer);
                    } else {
                      const text = await file.text();
                      matrix = parseDelimitedText(text);
                    }

                    if (!matrix.length) {
                      toast.error("No data rows found in file");
                      return;
                    }

                    // Convert to text for preview in paste tab
                    const tsvText = matrix.map((r) => r.join("\t")).join("\n");
                    setPaste(tsvText);

                    const parsed = parseTemplateRows(matrix, catalog.products.data ?? [], productId);
                    if (parsed.error) {
                      toast.error(parsed.error);
                      return;
                    }

                    clearPreview();
                    setTab("paste");

                    if (parsed.unassignedProductsCount > 0 && !productId) {
                      setParseError("Some shades do not match an existing product in the catalog. Please select a target product above.");
                      toast.info("Select a product above for unassigned shades, then validate.");
                    } else if (parsed.rows.length > 500) {
                      setParseError("Maximum 500 rows allowed per import.");
                    } else {
                      setParseError("");
                      preview.mutate(parsed.rows, {
                        onSuccess: () => setSnapshot(parsed.rows),
                      });
                      toast.success(`Loaded ${parsed.rows.length} shade(s) from ${file.name}`);
                    }
                  } catch {
                    toast.error("Unable to parse file. Make sure it is a valid Excel or text file.");
                  } finally {
                    input.value = "";
                  }
                }}
              />
            </div>
          </TabsContent>
          <TabsContent value="manage">
            <div className="mt-4">
              <ShadeDatabase editable />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
}
