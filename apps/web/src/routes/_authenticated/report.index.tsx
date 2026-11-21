import { createFileRoute } from "@tanstack/react-router";
import { ReportPage } from "@/features/report/components/report-page";
export const Route = createFileRoute("/_authenticated/report/")({
  head: () => ({
    meta: [{ title: "Report" }],
  }),
  component: ReportPage,
});
