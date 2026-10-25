import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageToolbar,
  ShadeSwatch,
  StatusBadge,
  EmptyState,
  LoadingState,
} from "@/components/shared/workspace-components";
import { CatalogSidebar } from "@/components/api/catalog-sidebar";
import { PrototypeDetail } from "@/components/api/prototype-detail";
import {
  ApiError,
  FieldSelect,
  ResultsPagination,
} from "@/components/api/api-feedback";
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
import { api, apiError } from "@/services/color-bank-api";
import type { PrototypeInput, RequestStatus } from "@/types/api";
const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  formulating: "Formulating",
  completed: "Result uploaded",
  declined: "Declined",
} as const;
export function ColorBankPage() {
  const [format, setFormat] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const formats = useQuery({
    queryKey: ["formats"],
    queryFn: ({ signal }) => api.formats(signal),
  });
  const items = formats.data?.flatMap((format) => format.items) ?? [];
  const requests = useQuery({
    queryKey: ["requests", { page, format, status }],
    queryFn: ({ signal }) =>
      api.requests(
        {
          page,
          pageSize: 25,
          ...(format ? { formatItemId: format } : {}),
          ...(status ? { status: status as RequestStatus } : {}),
        },
        signal,
      ),
    placeholderData: keepPreviousData,
  });
  const activeId = selected ?? requests.data?.items[0]?.id ?? null;
  const request = useQuery({
    queryKey: ["request", activeId],
    queryFn: ({ signal }) => api.request(activeId!, signal),
    enabled: !!activeId,
  });
  const create = useMutation({
    mutationFn: api.createRequest,
    onSuccess: async (row) => {
      setStatus("");
      setFormat(null);
      setPage(1);
      setSelected(row.id);
      setOpen(false);
      await client.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Prototype request submitted");
    },
    onError: (error) => toast.error(apiError(error)),
  });
  const detail = !activeId ? (
    <EmptyState
      title="Request detail"
      description="Select or create a prototype request."
    />
  ) : request.isPending ? (
    <div className="p-4">
      <LoadingState label="Loading request…" />
    </div>
  ) : request.isError ? (
    <div className="p-3">
      <ApiError error={request.error} retry={() => void request.refetch()} />
    </div>
  ) : (
    <PrototypeDetail
      key={`${request.data.id}:${request.data.status}`}
      request={request.data}
      formatName={
        items.find((item) => item.id === request.data.formatItemId)?.name ??
        "Product format"
      }
    />
  );
  return (
    <PageShell
      section="Color Bank"
      sidebar={
        <CatalogSidebar
          value={format}
          onChange={(value) => {
            setFormat(value);
            setSelected(null);
            setPage(1);
          }}
        />
      }
      detailPanel={detail}
    >
      <PageToolbar title="Color Bank" description="Prototype shade requests">
        <FieldSelect
          aria-label="Filter request status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setSelected(null);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {value === "declined" ? "Declined" : label}
            </option>
          ))}
        </FieldSelect>
        <Button
          disabled={formats.isPending || formats.isError || !items.length}
          onClick={() => {
            create.reset();
            setOpen(true);
          }}
        >
          + New request
        </Button>
      </PageToolbar>
      {formats.isError && (
        <div className="p-4">
          <ApiError
            error={formats.error}
            retry={() => void formats.refetch()}
          />
        </div>
      )}
      {formats.data && !items.length && (
        <p className="p-4 text-xs text-muted-foreground">
          Add a product format in Data Input before creating requests.
        </p>
      )}
      {requests.isPending ? (
        <div className="p-5">
          <LoadingState label="Loading requests…" />
        </div>
      ) : requests.isError ? (
        <div className="p-5">
          <ApiError
            error={requests.error}
            retry={() => void requests.refetch()}
          />
        </div>
      ) : (
        <>
          {!requests.data.items.length ? (
            <EmptyState
              title="No prototype requests"
              description="Create a request or adjust the current filters."
            />
          ) : (
            requests.data.items.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelected(row.id)}
                aria-pressed={row.id === activeId}
                className="flex w-full flex-wrap items-center gap-3 border-b p-4 text-left text-xs hover:bg-muted aria-pressed:bg-accent"
              >
                {row.targetHex && <ShadeSwatch hex={row.targetHex} />}
                <div className="min-w-0 flex-1">
                  <strong className="font-medium">
                    {row.autoName ?? `Request ${row.id.slice(0, 8)}`}
                  </strong>
                  <p className="mt-1 text-muted-foreground">
                    {row.brandNameNew} · {row.productNameNew} ·{" "}
                    {row.shadeNameNew}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {row.priority} priority
                </span>
                <StatusBadge status={statusLabels[row.status]} />
              </button>
            ))
          )}
          <div className="px-5">
            <ResultsPagination
              page={page}
              total={requests.data.pagination.total}
              pageSize={25}
              onPageChange={(value) => {
                setSelected(null);
                setPage(value);
              }}
              disabled={requests.isFetching}
            />
          </div>
        </>
      )}
      <div className="border-t xl:hidden">{detail}</div>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!create.isPending) setOpen(value);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New prototype request</DialogTitle>
            <DialogDescription>
              Submit a benchmark-matching or gap-filling request.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const body: PrototypeInput = {
                type: String(data.get("type")) as PrototypeInput["type"],
                priority: String(
                  data.get("priority"),
                ) as PrototypeInput["priority"],
                brandNameNew: String(data.get("brand")).trim(),
                productNameNew: String(data.get("product")).trim(),
                shadeNameNew: String(data.get("shade")).trim(),
                targetHex: String(data.get("hex")).trim(),
                formatItemId: Number(data.get("format")),
                description: String(data.get("notes")).trim(),
              };
              create.mutate(body);
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-xs">
                Request type
                <FieldSelect name="type">
                  <option value="gap_filling">Gap filling</option>
                  <option value="benchmark_matching">Benchmark matching</option>
                </FieldSelect>
              </label>
              <label className="grid gap-2 text-xs">
                Priority
                <FieldSelect name="priority" defaultValue="medium">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </FieldSelect>
              </label>
            </div>
            <label className="grid gap-2 text-xs">
              Product format
              <FieldSelect
                name="format"
                defaultValue={format ?? items[0]?.id}
                required
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </FieldSelect>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-xs">
                Target brand
                <Input name="brand" required maxLength={255} />
              </label>
              <label className="grid gap-2 text-xs">
                Target product
                <Input name="product" required maxLength={255} />
              </label>
              <label className="grid gap-2 text-xs">
                Target shade
                <Input name="shade" required maxLength={255} />
              </label>
              <label className="grid gap-2 text-xs">
                Target HEX
                <Input
                  name="hex"
                  defaultValue="#aa6d78"
                  pattern="#[0-9a-fA-F]{6}"
                  required
                />
              </label>
            </div>
            <label className="grid gap-2 text-xs">
              Notes
              <Textarea name="notes" maxLength={20000} />
            </label>
            {create.isError && <ApiError error={create.error} />}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={create.isPending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Submitting…" : "Submit request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
