import { TriangleAlertIcon } from "lucide-react";
import { ReportForm } from "./report-form";

export function ReportSidebar() {
  return (
    <aside className="shrink-0 border-b lg:w-76 lg:border-r lg:border-b-0">
      <h2 className="flex h-12 items-center gap-2 border-b px-5 text-sm font-medium">
        <span className="flex size-6 items-center justify-center rounded-md bg-warning text-warning-foreground">
          <TriangleAlertIcon className="size-4" />
        </span>
        Submit a report
      </h2>
      <ReportForm />
    </aside>
  );
}
