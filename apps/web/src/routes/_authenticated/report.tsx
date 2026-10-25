import { createFileRoute } from "@tanstack/react-router";
import { ReportPage } from "@/pages/report-page";
export const Route = createFileRoute("/_authenticated/report")({
  component: ReportPage,
});
