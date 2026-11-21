import { type ReportStatus, reportStatus } from "@color-bank-hub/contracts/report";
import { useState } from "react";
import { useReports } from "@/api/reports/report-queries";
import { PageShell } from "@/components/layout/page-shell";
import { ApiError, ResultsPagination } from "@/components/shared/request-feedback";
import { EmptyState, LoadingState } from "@/components/shared/workspace-components";
import { useCan } from "@/features/auth/hooks/use-can";
import { cn } from "@/lib/utils";
import { ReportCard } from "./report-card";
import { ReportSidebar } from "./report-sidebar";

const PAGE_SIZE = 20;

export function ReportPage() {
  const canSeeAll = useCan("report:resolve");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ReportStatus>();
  const reports = useReports({ page, pageSize: PAGE_SIZE, status });

  return (
    <PageShell section="Report">
      <div className="flex min-h-full flex-col lg:flex-row">
        <ReportSidebar />
        <section className="flex min-w-0 flex-1 flex-col bg-muted/30">
          <div className="flex h-12 flex-wrap items-center justify-between gap-2 border-b bg-background px-5">
            <h2 className="text-sm font-medium">Reports</h2>
            <div className="flex flex-wrap gap-2">
              {[undefined, ...reportStatus.options].map((option) => (
                <button
                  key={option ?? "all"}
                  type="button"
                  className={cn(
                    "rounded-full border px-3 py-0.5 text-xs capitalize transition-colors hover:bg-muted",
                    status === option && "border-primary bg-primary/10 text-primary hover:bg-primary/10",
                  )}
                  onClick={() => {
                    setStatus(option);
                    setPage(1);
                  }}
                >
                  {option ?? "All"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 p-5">
            {reports.isPending ? (
              <LoadingState label="Loading reports…" />
            ) : reports.isError ? (
              <ApiError error={reports.error} retry={() => void reports.refetch()} />
            ) : (
              <>
                {reports.data.items.length === 0 ? (
                  <EmptyState title="No reports found" description="Submitted reports will appear here." />
                ) : (
                  reports.data.items.map((report) => <ReportCard key={report.id} report={report} showReporter={canSeeAll} />)
                )}
                <div className="mt-auto">
                  <ResultsPagination
                    page={page}
                    total={reports.data.pagination.total}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                    disabled={reports.isFetching}
                  />
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
