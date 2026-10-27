import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageToolbar,
  ShadeSwatch,
  LoadingState,
} from "@/components/shared/workspace-components";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ApiError, FieldSelect } from "@/components/shared/request-feedback";
import { CatalogSetup } from "@/components/catalog/catalog-setup";
import { ShadeDatabase } from "@/components/shades/shade-database";
import { useCatalog } from "@/hooks/use-catalog";
import { apiError } from "@/services/api-error";
import { shadesApi } from "@/services/shades-api";
import { importsApi } from "@/services/imports-api";
import type { ShadeInput } from "@/types/api";
export function DataInputPage() {
  const [tab, setTab] = useState("manual");
  const [productId, setProductId] = useState("");
  const [hex, setHex] = useState("#aa6d78");
  const [paste, setPaste] = useState("");
  const [snapshot, setSnapshot] = useState<ShadeInput[]>([]);
  const [parseError, setParseError] = useState("");
  const catalog = useCatalog();
  const client = useQueryClient();
  const product = catalog.products.data?.find((item) => item.id === productId);
  async function refresh() {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["shades"] }),
      client.invalidateQueries({ queryKey: ["formats"] }),
    ]);
  }
  const create = useMutation({
    mutationFn: shadesApi.createShade,
    onSuccess: async () => {
      await refresh();
      toast.success("Shade added to the database");
    },
    onError: (error) => toast.error(apiError(error)),
  });
  const preview = useMutation({
    mutationFn: importsApi.previewImport,
    onError: (error) => toast.error(apiError(error)),
  });
  const commit = useMutation({
    mutationFn: importsApi.commitImport,
    onSuccess: async (result) => {
      setPaste("");
      setSnapshot([]);
      preview.reset();
      await refresh();
      toast.success(`${result.imported} shades imported`);
    },
    onError: (error) => toast.error(apiError(error)),
  });
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
  const productSelect = (
    <label className="grid gap-2 text-xs">
      Product
      <FieldSelect
        value={productId}
        onChange={(event) => changeProduct(event.target.value)}
        required
        disabled={
          catalog.products.isPending || catalog.products.isError || busy
        }
      >
        <option value="">Select a product</option>
        {catalog.products.data?.map((item) => (
          <option key={item.id} value={item.id}>
            {catalog.brands.data?.find((brand) => brand.id === item.brandId)
              ?.name ?? "Brand"}{" "}
            · {item.name}
          </option>
        ))}
      </FieldSelect>
    </label>
  );
  return (
    <PageShell section="Data Input">
      <PageToolbar
        title="Data Input"
        description="Add, import, and update shade data"
      />
      <div className="space-y-4 p-5">
        <CatalogSetup onProductCreated={changeProduct} />
        {catalog.products.isPending && (
          <LoadingState label="Loading product catalog…" />
        )}
        {catalog.products.isError && (
          <ApiError
            error={catalog.products.error}
            retry={() => void catalog.products.refetch()}
          />
        )}{" "}
        {catalog.brands.isError && (
          <ApiError
            error={catalog.brands.error}
            retry={() => void catalog.brands.refetch()}
          />
        )}{" "}
        {catalog.formats.isError && (
          <ApiError
            error={catalog.formats.error}
            retry={() => void catalog.formats.refetch()}
          />
        )}{" "}
        {catalog.products.data?.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Create a format, then a brand and product to start adding shades.
          </p>
        )}
        <Tabs
          value={tab}
          onValueChange={(value) => {
            if (value && !busy) setTab(value);
          }}
        >
          <div className="overflow-x-auto border-b">
            <TabsList
              variant="line"
              className="h-10! w-max justify-start gap-1 rounded-none p-0"
            >
              {[
                { value: "paste", label: "Paste from Excel" },
                { value: "upload", label: "File Upload" },
                { value: "manual", label: "Manual Entry" },
                { value: "manage", label: "Manage Database" },
              ].map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  disabled={busy}
                  className="h-10 flex-none px-4 after:bottom-0!"
                >
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
                const lip = String(data.get("lipPhotoUrl")).trim();
                const swatch = String(data.get("swatchPhotoUrl")).trim();
                const body: ShadeInput = {
                  productId,
                  sku: String(data.get("sku")).trim(),
                  name: String(data.get("name")).trim(),
                  hex: hex.trim(),
                  ...(lip ? { lipPhotoUrl: lip } : {}),
                  ...(swatch ? { swatchPhotoUrl: swatch } : {}),
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
                  <Input name="sku" required maxLength={255} />
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
              <p className="text-[11px] text-muted-foreground">
                RGB, HSL, HSV, Lab, and LCh are computed by the API. Business
                classifications remain unassigned until rules are configured.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-xs">
                  Photo on lips URL
                  <Input
                    name="lipPhotoUrl"
                    type="url"
                    pattern="https?://.*"
                    placeholder="https://…"
                  />
                </label>
                <label className="grid gap-2 text-xs">
                  Swatch photo URL
                  <Input
                    name="swatchPhotoUrl"
                    type="url"
                    pattern="https?://.*"
                    placeholder="https://…"
                  />
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Use hosted image URLs. Image file storage is not configured.
              </p>
              <label className="grid gap-2 text-xs">
                Product ingredients
                <Textarea
                  readOnly
                  value={
                    product?.ingredientsInci ??
                    "Select a product to view its ingredients."
                  }
                />
              </label>
              {create.isError && <ApiError error={create.error} />}
              <Button
                type="submit"
                disabled={
                  !productId || create.isPending || catalog.products.isError
                }
              >
                {create.isPending ? "Adding shade…" : "+ Add shade"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="paste">
            <div className="mt-4 w-full space-y-4 rounded-md border bg-card p-5">
              <h2 className="text-sm font-medium">Paste from Excel</h2>
              {productSelect}
              <p className="text-xs text-muted-foreground">
                Paste three tab-separated columns: SKU, shade name, HEX. All
                rows belong to the selected product. An optional header row is
                supported. Maximum 500 rows.
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
                  "SKU\tShade name\tHEX\nEMINA-08\t08 Ube Mochi\t#aa6d78"
                }
              />
              {parseError && (
                <p role="alert" className="text-xs text-destructive">
                  {parseError}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!productId || !paste.trim() || busy}
                  onClick={() => {
                    clearPreview();
                    const lines = paste
                      .split(/\r?\n/)
                      .filter((line) => line.trim());
                    let cells = lines.map((line) =>
                      line.split("\t").map((value) => value.trim()),
                    );
                    if (cells[0]?.[0].toLowerCase() === "sku")
                      cells = cells.slice(1);
                    if (
                      !cells.length ||
                      cells.length > 500 ||
                      cells.some((row) => row.length !== 3)
                    ) {
                      setParseError(
                        "Enter 1–500 rows with exactly three columns: SKU, shade name, HEX.",
                      );
                      return;
                    }
                    const rows = cells.map(([sku, name, hex]) => ({
                      productId,
                      sku,
                      name,
                      hex,
                    }));
                    if (
                      new Blob([JSON.stringify({ rows })]).size >
                      2 * 1024 * 1024
                    ) {
                      setParseError("Import request exceeds the 2 MB limit.");
                      return;
                    }
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
                  onClick={() => commit.mutate(snapshot)}
                >
                  {commit.isPending ? "Importing…" : "Import validated rows"}
                </Button>
              </div>
              {preview.isError && <ApiError error={preview.error} />}{" "}
              {commit.isError && <ApiError error={commit.error} />}{" "}
              {preview.data && (
                <>
                  <p className="text-xs text-muted-foreground">
                    {preview.data.validCount} of {preview.data.rowCount} rows
                    valid
                  </p>
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          {["Row", "SKU", "Shade", "HEX", "Validation"].map(
                            (name) => (
                              <th
                                key={name}
                                className="border-b bg-muted p-2 text-left font-medium"
                              >
                                {name}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.data.rows.map((row) => (
                          <tr key={row.row}>
                            <td className="border-b p-2">{row.row}</td>
                            <td className="border-b p-2">
                              {snapshot[row.row - 1]?.sku ?? "—"}
                            </td>
                            <td className="border-b p-2">
                              {snapshot[row.row - 1]?.name ?? "—"}
                            </td>
                            <td className="border-b p-2">
                              {snapshot[row.row - 1]?.hex ?? "—"}
                            </td>
                            <td
                              className={`border-b p-2 ${row.valid ? "text-success-foreground" : "text-destructive"}`}
                            >
                              {row.valid
                                ? "Valid"
                                : row.errors
                                    .map(
                                      (error) =>
                                        `${error.path ? `${error.path}: ` : ""}${error.message}`,
                                    )
                                    .join("; ")}
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
              <h2 className="text-sm font-medium">Upload tab-separated data</h2>
              <p className="max-w-lg text-xs text-muted-foreground">
                Choose a .tsv file with SKU, shade name, and HEX columns. It
                will open in the import preview. XLSX parsing is not configured.
              </p>
              <Input
                className="max-w-md"
                aria-label="Upload TSV file"
                type="file"
                accept=".tsv,text/tab-separated-values"
                onChange={async (event) => {
                  const input = event.currentTarget;
                  const file = input.files?.[0];
                  if (!file) return;
                  if (!file.name.toLowerCase().endsWith(".tsv")) {
                    toast.error("Choose a .tsv file");
                    input.value = "";
                    return;
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    toast.error("Choose a file under 2 MB");
                    input.value = "";
                    return;
                  }
                  try {
                    setPaste(await file.text());
                    clearPreview();
                    setTab("paste");
                    toast.info(
                      "File loaded. Select its product and validate before importing.",
                    );
                  } catch {
                    toast.error("Unable to read file");
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
