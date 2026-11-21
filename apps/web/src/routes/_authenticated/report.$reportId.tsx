import { createFileRoute } from "@tanstack/react-router";
import { ReportDetailPage } from "@/features/report/components/report-detail-page";

export const Route = createFileRoute("/_authenticated/report/$reportId")({
  head: () => ({
    meta: [{ title: "Report" }],
  }),
  component: ReportDetailPage,
});
