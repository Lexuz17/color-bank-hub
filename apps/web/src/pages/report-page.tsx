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
  EmptyState,
  LoadingState,
  StatusBadge,
} from "@/components/shared/workspace-components";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  FieldSelect,
  ResultsPagination,
} from "@/components/api/api-feedback";
import { api, apiError } from "@/services/color-bank-api";
import type { ReportInput, Report, Priority } from "@/types/api";
export function ReportPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [brandId, setBrandId] = useState("");
  const [shadeSearch, setShadeSearch] = useState("");
  const [shadeId, setShadeId] = useState("");
  const client = useQueryClient();
  const reports = useQuery({
    queryKey: ["reports", { page, status }],
    queryFn: ({ signal }) =>
      api.reports(
        {
          page,
          pageSize: 20,
          status: status ? (status as Report["status"]) : undefined,
        },
        signal,
      ),
    placeholderData: keepPreviousData,
  });
  const brands = useQuery({
    queryKey: ["brands"],
    queryFn: ({ signal }) => api.brands(signal),
  });
  const shades = useQuery({
    queryKey: ["shades", "report-lookup", brandId, shadeSearch],
    queryFn: ({ signal }) =>
      api.shades(
        {
          pageSize: 100,
          brandId: brandId || undefined,
          search: shadeSearch || undefined,
        },
        signal,
      ),
  });
  const create = useMutation({
    mutationFn: api.createReport,
    onSuccess: async () => {
      setPage(1);
      await client.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report submitted");
    },
    onError: (error) => toast.error(apiError(error)),
  });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Report["status"] }) =>
      api.updateReport(id, status),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report status updated");
    },
    onError: (error) => toast.error(apiError(error)),
  });
  return (
    <PageShell section="Report">
      <PageToolbar
        title="Report"
        description="Submit data issues or request shade corrections"
      />
      <div className="grid gap-6 p-5 lg:grid-cols-[320px_1fr]">
        <form
          className="space-y-4 rounded-md border bg-card p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            const reference = String(data.get("reference")).trim();
            const description = `${data.get("type")}\n${String(data.get("description")).trim()}`;
            const body: ReportInput = {
              description,
              priority: String(data.get("priority")) as Priority,
              ...(brandId ? { brandId } : {}),
              ...(shadeId ? { shadeId } : {}),
              ...(reference ? { attachmentUrls: [reference] } : {}),
            };
            create.mutate(body, {
              onSuccess: () => {
                form.reset();
                setShadeId("");
                setBrandId("");
                setShadeSearch("");
              },
            });
          }}
        >
          <h2 className="text-sm font-medium">Submit a report</h2>
          <label className="grid gap-2 text-xs">
            Report type
            <FieldSelect name="type">
              <option>Data issue</option>
              <option>Shade correction</option>
            </FieldSelect>
          </label>
          <label className="grid gap-2 text-xs">
            Brand (optional)
            <FieldSelect
              value={brandId}
              disabled={brands.isPending || brands.isError}
              onChange={(event) => {
                setBrandId(event.target.value);
                setShadeId("");
              }}
            >
              <option value="">Any brand</option>
              {brands.data?.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </FieldSelect>
          </label>
          {brands.isError && (
            <ApiError
              error={brands.error}
              retry={() => void brands.refetch()}
            />
          )}
          <label className="grid gap-2 text-xs">
            Search product, shade, or SKU
            <Input
              value={shadeSearch}
              onChange={(event) => {
                setShadeSearch(event.target.value);
                setShadeId("");
              }}
              placeholder="Find a related shade…"
            />
          </label>
          <label className="grid gap-2 text-xs">
            Related shade (optional)
            <FieldSelect
              value={shadeId}
              disabled={shades.isPending || shades.isError}
              onChange={(event) => setShadeId(event.target.value)}
            >
              <option value="">No related shade</option>
              {shades.data?.items.map((shade) => (
                <option key={shade.id} value={shade.id}>
                  {shade.brand.name} · {shade.product.name} · {shade.name}
                </option>
              ))}
            </FieldSelect>
          </label>
          {shades.isError && (
            <ApiError
              error={shades.error}
              retry={() => void shades.refetch()}
            />
          )}
          <label className="grid gap-2 text-xs">
            Priority
            <FieldSelect name="priority" defaultValue="medium">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </FieldSelect>
          </label>
          <label className="grid gap-2 text-xs">
            Issue description
            <Textarea
              name="description"
              required
              minLength={10}
              maxLength={19000}
            />
          </label>
          <label className="grid gap-2 text-xs">
            Supporting reference URL
            <Input name="reference" type="url" pattern="https?://.*" />
          </label>
          {create.isError && <ApiError error={create.error} />}
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Submitting…" : "Submit report"}
          </Button>
        </form>
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">Submitted reports</h2>
            <FieldSelect
              aria-label="Filter report status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </FieldSelect>
          </div>
          {reports.isPending ? (
            <LoadingState label="Loading reports…" />
          ) : reports.isError ? (
            <ApiError
              error={reports.error}
              retry={() => void reports.refetch()}
            />
          ) : (
            <>
              {!reports.data.items.length ? (
                <EmptyState
                  title="No reports found"
                  description="Submitted reports will appear here."
                />
              ) : (
                reports.data.items.map((report) => (
                  <article
                    key={report.id}
                    className="mb-3 rounded-md border bg-card p-4 text-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <strong className="font-medium">
                        Report {report.id.slice(0, 8)}
                      </strong>
                      <StatusBadge
                        status={
                          report.status === "pending" ? "Pending" : "Resolved"
                        }
                      />
                    </div>
                    <p className="my-3 whitespace-pre-wrap text-muted-foreground">
                      {report.description}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString()} ·{" "}
                        {report.priority} priority
                      </p>
                      <Button
                        size="xs"
                        variant="outline"
                        disabled={update.isPending}
                        onClick={() =>
                          update.mutate({
                            id: report.id,
                            status:
                              report.status === "pending"
                                ? "resolved"
                                : "pending",
                          })
                        }
                      >
                        {report.status === "pending"
                          ? "Mark resolved"
                          : "Reopen"}
                      </Button>
                    </div>
                    {report.attachmentUrls?.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block break-all text-primary underline"
                      >
                        Supporting reference
                      </a>
                    ))}
                  </article>
                ))
              )}
              <ResultsPagination
                page={page}
                total={reports.data.pagination.total}
                pageSize={20}
                onPageChange={setPage}
                disabled={reports.isFetching}
              />
            </>
          )}
        </section>
      </div>
    </PageShell>
  );
}
