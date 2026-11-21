import { type ReportResponse, reportIssueLabels } from "@color-bank-hub/contracts/report";
import { Link } from "@tanstack/react-router";
import { ShadeSwatch } from "@/components/shared/workspace-components";
import { formatDateTime } from "@/lib/date";
import { ReportStatusBadge } from "./report-status-badge";

interface Props {
  report: ReportResponse;
  showReporter: boolean;
}

export function ReportCard({ report, showReporter }: Props) {
  const { shade, product, brand } = report;
  return (
    <Link
      to="/report/$reportId"
      params={{ reportId: report.id }}
      className="block rounded-lg bg-card p-5 text-xs shadow-sm outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <strong className="text-sm font-medium">
          {reportIssueLabels[report.issueType]}
          {brand && ` - ${brand.name}`}
        </strong>
        <ReportStatusBadge status={report.status} />
      </div>
      {product && (
        <p className="mt-2 flex items-center gap-2 text-muted-foreground">
          {shade && <ShadeSwatch hex={shade.hex} className="size-3.5" />}
          {product.name}
          {shade && ` · ${shade.name}`}
        </p>
      )}
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{report.description}</p>
      <p className="mt-4 text-[11px] text-muted-foreground">
        {showReporter && `by ${report.reporter.name} • `}
        {formatDateTime(report.createdAt)} • Priority: <span className="font-semibold capitalize">{report.priority}</span>
      </p>
    </Link>
  );
}
