import type { ReportStatus } from "@color-bank-hub/contracts/report";
import { Badge } from "@/components/ui/badge";

const variants = { pending: "warning", resolved: "success", closed: "neutral", rejected: "destructive" } as const satisfies Record<
  ReportStatus,
  string
>;

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  );
}
