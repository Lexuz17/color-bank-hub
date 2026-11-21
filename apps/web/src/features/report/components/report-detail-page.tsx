import { reportIssueLabels } from "@color-bank-hub/contracts/report";
import { Link, useParams } from "@tanstack/react-router";
import { FileTextIcon } from "lucide-react";
import { useShade } from "@/api/shades/shade-queries";
import { PageShell } from "@/components/layout/page-shell";
import { ApiError } from "@/components/shared/request-feedback";
import { LoadingState } from "@/components/shared/workspace-components";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { formatDateTime } from "@/lib/date";
import { useReport } from "../hooks/report-queries";
import { ReportActions } from "./report-actions";
import { ReportSidebar } from "./report-sidebar";
import { ReportStatusBadge } from "./report-status-badge";
import { ShadeDetails } from "./shade-details";
import { ReportTimeline } from "./report-timeline";

const imageTypes = ["jpg", "jpeg", "png", "webp"];

export function ReportDetailPage() {
  const { reportId } = useParams({ from: "/_authenticated/report/$reportId" });
  const report = useReport(reportId);
  const shade = useShade(report.data?.shade?.id ?? null);

  const title = report.data ? `${reportIssueLabels[report.data.issueType]}${report.data.brand ? ` - ${report.data.brand.name}` : ""}` : "Report";

  return (
    <PageShell section="Report">
      <div className="flex min-h-full flex-col lg:flex-row">
        <ReportSidebar />
        <section className="min-w-0 flex-1 bg-muted/30">
          <div className="flex h-12 items-center border-b bg-background px-5">
            <Breadcrumb>
              <BreadcrumbList className="text-sm">
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link to="/report" />}>Reports</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="space-y-4 p-5">
            {report.isPending ? (
              <LoadingState label="Loading report…" />
            ) : report.isError ? (
              <ApiError error={report.error} retry={() => void report.refetch()} />
            ) : (
              <>
                <section className="space-y-4 rounded-lg bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="text-sm font-medium">{title}</h1>
                    <ReportStatusBadge status={report.data.status} />
                  </div>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs sm:grid-cols-4">
                    <div>
                      <dt className="text-[11px] text-muted-foreground">Reporter</dt>
                      <dd className="font-medium">{report.data.reporter.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-muted-foreground">Submitted</dt>
                      <dd className="font-medium">{formatDateTime(report.data.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-muted-foreground">Priority</dt>
                      <dd className="font-medium capitalize">{report.data.priority}</dd>
                    </div>
                    {!report.data.shade && report.data.product && (
                      <div>
                        <dt className="text-[11px] text-muted-foreground">Product</dt>
                        <dd className="font-medium">{report.data.product.name}</dd>
                      </div>
                    )}
                  </dl>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{report.data.description}</p>
                  {report.data.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {report.data.attachments.map((attachment, index) => {
                        const extension = attachment.key.split(".").pop() ?? "";
                        return (
                          <a key={attachment.key} href={attachment.url} target="_blank" rel="noreferrer">
                            {imageTypes.includes(extension) ? (
                              <img src={attachment.url} alt={`Attachment ${index + 1}`} className="h-28 rounded-md object-cover" />
                            ) : (
                              <span className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-md bg-muted text-xs text-muted-foreground">
                                <FileTextIcon className="size-6" />
                                {extension.toUpperCase()}
                              </span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  )}
                  <ReportActions report={report.data} />
                </section>
                {shade.isError && <ApiError error={shade.error} retry={() => void shade.refetch()} />}
                {shade.data && <ShadeDetails shade={shade.data} />}
                <section className="rounded-lg bg-card p-5 shadow-sm">
                  <h2 className="mb-4 text-sm font-medium">Activity</h2>
                  <ReportTimeline report={report.data} />
                </section>
              </>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
