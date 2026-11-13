import { useState } from "react";
import { useCatalog } from "@/features/data-input/hooks/catalog-queries";
import {
  type CatalogRecordMode,
  useCreateCatalogRecord,
} from "@/features/data-input/hooks/data-input-mutations";
import { ApiError, FieldSelect } from "@/components/shared/request-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
type Mode = CatalogRecordMode;
export function CatalogSetup({
  onProductCreated,
}: {
  onProductCreated: (id: string) => void;
}) {
  const [mode, setMode] = useState<Mode | null>(null);
  const catalog = useCatalog();
  const create = useCreateCatalogRecord();
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] text-muted-foreground">
          Catalog setup
        </span>
        {(["format", "brand", "product"] as const).map((kind) => (
          <Button
            key={kind}
            size="xs"
            variant="outline"
            disabled={
              kind === "product" &&
              (!catalog.brands.data?.length || !catalog.items.length)
            }
            onClick={() => {
              create.reset();
              setMode(kind);
            }}
          >
            + Add {kind}
          </Button>
        ))}
      </div>
      <Dialog
        open={!!mode}
        onOpenChange={(open) => {
          if (!open && !create.isPending) setMode(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add {mode}</DialogTitle>
            <DialogDescription>
              {mode === "product"
                ? "Create a product before adding its shades."
                : mode === "format"
                  ? "Add a subcategory to a new or existing parent format."
                  : "Add a brand to the product catalog."}
            </DialogDescription>
          </DialogHeader>
          {mode && (
            <form
              key={mode}
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                create.mutate(
                  { mode, data: new FormData(event.currentTarget) },
                  {
                    onSuccess: (result) => {
                      if (result.mode === "product")
                        onProductCreated(result.record.id);
                      setMode(null);
                    },
                  },
                );
              }}
            >
              {mode === "format" && (
                <label className="grid gap-2 text-xs">
                  Parent format name
                  <Input
                    name="parent"
                    required
                    placeholder="Lip Tint"
                    maxLength={255}
                  />
                </label>
              )}
              {mode === "product" && (
                <>
                  <label className="grid gap-2 text-xs">
                    Brand
                    <FieldSelect name="brandId" required defaultValue="">
                      <option value="" disabled>
                        Select a brand
                      </option>
                      {catalog.brands.data?.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </FieldSelect>
                  </label>
                  <label className="grid gap-2 text-xs">
                    Product format
                    <FieldSelect
                      name="productFormatItemId"
                      required
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select a format
                      </option>
                      {catalog.items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </FieldSelect>
                  </label>
                </>
              )}
              <label className="grid gap-2 text-xs">
                {mode === "format" ? "Subcategory name" : "Name"}
                <Input name="name" required maxLength={255} />
              </label>
              {mode === "format" && (
                <label className="grid gap-2 text-xs">
                  Unique format code
                  <Input
                    name="code"
                    required
                    maxLength={4}
                    pattern="[A-Za-z0-9]{1,4}"
                    placeholder="TG"
                  />
                </label>
              )}
              {mode === "brand" && (
                <label className="flex items-center gap-2 text-xs">
                  <input
                    name="isOwn"
                    type="checkbox"
                    className="accent-primary"
                  />
                  Own brand (allows color composition)
                </label>
              )}
              {mode === "product" && (
                <label className="grid gap-2 text-xs">
                  Full ingredients
                  <Textarea name="ingredients" required maxLength={20000} />
                </label>
              )}
              {create.isError && <ApiError error={create.error} />}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={create.isPending}
                  onClick={() => setMode(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending ? "Creating…" : `Create ${mode}`}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
