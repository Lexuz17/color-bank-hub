import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { apiError } from "@/services/api-error";
import { catalogApi } from "@/services/catalog-api";
import { shadesApi } from "@/services/shades-api";
import type { Shade, ShadePatch, Season } from "@/types/api";
import {
  SearchInput,
  ShadeSwatch,
  StatusBadge,
  LoadingState,
} from "@/components/shared/workspace-components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ApiError,
  FieldSelect,
  ResultsPagination,
} from "@/components/shared/request-feedback";
const seasonLabels = {
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
} as const;
const toneLabels = { warm: "Warm", neutral: "Neutral", cool: "Cool" } as const;
export function ShadeDatabase({
  formatItemId = null,
  onInspect,
  editable = false,
}: {
  formatItemId?: number | null;
  onInspect?: (id: string) => void;
  editable?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [brandId, setBrandId] = useState("");
  const [season, setSeason] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("name");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [editing, setEditing] = useState<Shade | null>(null);
  const client = useQueryClient();
  const params = {
    page,
    pageSize: 25,
    search: search || undefined,
    brandId: brandId || undefined,
    formatItemId: formatItemId ?? undefined,
    season: season ? (season as Season) : undefined,
    sort,
    direction,
  };
  const rows = useQuery({
    queryKey: ["shades", params],
    queryFn: ({ signal }) => shadesApi.shades(params, signal),
    placeholderData: keepPreviousData,
  });
  const brands = useQuery({
    queryKey: ["brands"],
    queryFn: ({ signal }) => catalogApi.brands(signal),
  });
  const save = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShadePatch }) =>
      shadesApi.updateShade(id, data),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["shades"] }),
        client.invalidateQueries({ queryKey: ["shade"] }),
      ]);
      setEditing(null);
      toast.success("Shade updated");
    },
    onError: (error) => toast.error(apiError(error)),
  });
  function sortBy(column: string) {
    setSort(column);
    setDirection(sort === column && direction === "asc" ? "desc" : "asc");
    setPage(1);
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          className="w-full sm:w-72"
        />
        <FieldSelect
          aria-label="Filter brand"
          value={brandId}
          onChange={(event) => {
            setBrandId(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All brands</option>
          {brands.data?.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </FieldSelect>
        <FieldSelect
          aria-label="Filter season"
          value={season}
          onChange={(event) => {
            setSeason(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All seasons</option>
          {Object.entries(seasonLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </FieldSelect>
        {rows.isFetching && !rows.isPending && (
          <span role="status" className="text-[10px] text-muted-foreground">
            Updating…
          </span>
        )}
      </div>
      {brands.isError && (
        <ApiError error={brands.error} retry={() => void brands.refetch()} />
      )}{" "}
      {rows.isPending ? (
        <LoadingState />
      ) : rows.isError ? (
        <ApiError error={rows.error} retry={() => void rows.refetch()} />
      ) : (
        <>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Product name</TableHead>
                  <TableHead
                    aria-sort={
                      sort === "name"
                        ? direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <button
                      type="button"
                      className="flex items-center gap-1"
                      onClick={() => sortBy("name")}
                    >
                      Shade name
                      <ArrowUpDown className="size-3" />
                    </button>
                  </TableHead>
                  <TableHead
                    aria-sort={
                      sort === "sku"
                        ? direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <button
                      type="button"
                      className="flex items-center gap-1"
                      onClick={() => sortBy("sku")}
                    >
                      SKU
                      <ArrowUpDown className="size-3" />
                    </button>
                  </TableHead>
                  <TableHead>Undertone</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead>HEX</TableHead>
                  {editable && <TableHead>Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.data.items.map((shade) => (
                  <TableRow key={shade.id}>
                    <TableCell>{shade.brand.name}</TableCell>
                    <TableCell>{shade.product.name}</TableCell>
                    <TableCell>
                      {onInspect ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-0"
                          onClick={() => onInspect(shade.id)}
                        >
                          <ShadeSwatch hex={shade.hex} />
                          {shade.name}
                        </Button>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ShadeSwatch hex={shade.hex} />
                          {shade.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{shade.sku}</TableCell>
                    <TableCell>
                      {shade.undertone ? (
                        <StatusBadge status={toneLabels[shade.undertone]} />
                      ) : (
                        <span className="text-muted-foreground">
                          Unclassified
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {shade.season ? (
                        <StatusBadge status={seasonLabels[shade.season]} />
                      ) : (
                        <span className="text-muted-foreground">
                          Unclassified
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <code>{shade.hex}</code>
                    </TableCell>
                    {editable && (
                      <TableCell>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            save.reset();
                            setEditing(shade);
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {rows.data.items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={editable ? 8 : 7}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No shades match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <ResultsPagination
            page={page}
            total={rows.data.pagination.total}
            pageSize={25}
            onPageChange={setPage}
            disabled={rows.isFetching}
          />
        </>
      )}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open && !save.isPending) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit shade</DialogTitle>
            <DialogDescription>
              Save changes to the color database.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <form
              key={editing.id}
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                save.mutate({
                  id: editing.id,
                  data: {
                    name: String(data.get("name")).trim(),
                    sku: String(data.get("sku")).trim(),
                    hex: String(data.get("hex")).trim(),
                  },
                });
              }}
            >
              <label className="grid gap-2 text-xs">
                Shade name
                <Input
                  name="name"
                  defaultValue={editing.name}
                  required
                  maxLength={255}
                />
              </label>
              <label className="grid gap-2 text-xs">
                SKU
                <Input
                  name="sku"
                  defaultValue={editing.sku}
                  required
                  maxLength={255}
                />
              </label>
              <label className="grid gap-2 text-xs">
                HEX code
                <Input
                  name="hex"
                  defaultValue={editing.hex}
                  required
                  pattern="#[0-9a-fA-F]{6}"
                />
              </label>
              {save.isError && <ApiError error={save.error} />}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={save.isPending}
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? "Saving…" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
