import type { ReportDetailResponse, ReportStatus } from "@color-bank-hub/contracts/report";
import { formatDateTime } from "@/lib/date";

const eventLabels: Record<ReportStatus, string> = {
  pending: "Reopened",
  resolved: "Resolved",
  rejected: "Rejected",
  closed: "Confirmed by reporter",
};

export function ReportTimeline({ report }: { report: ReportDetailResponse }) {
  const entries = [
    { key: "submitted", label: "Submitted", actor: report.reporter.name, time: report.createdAt, note: null as string | null },
    ...report.events.map((event) => ({
      key: String(event.id),
      label: event.autoClosed ? "Closed automatically" : eventLabels[event.to],
      actor: event.actor?.name ?? "System",
      time: event.createdAt,
      note: event.note,
    })),
  ];

  return (
    <ol className="ml-1 space-y-5 border-l pl-5">
      {entries.map((entry) => (
        <li key={entry.key} className="relative">
          <span className="absolute top-1 -left-6.5 size-2.5 rounded-full bg-primary" />
          <p className="text-xs font-medium">
            {entry.label} <span className="font-normal text-muted-foreground">by {entry.actor}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">{formatDateTime(entry.time)}</p>
          {entry.note && <p className="mt-1.5 rounded-md bg-muted px-3 py-2 text-xs whitespace-pre-wrap">{entry.note}</p>}
        </li>
      ))}
    </ol>
  );
}
