import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageToolbar,
  EmptyState,
  StatusBadge,
} from "@/components/shared/workspace-components";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
export function ReportPage() {
  const [reports, setReports] = useState<
    { id: string; product: string; description: string; date: string }[]
  >([]);
  return (
    <PageShell section="Report">
      <PageToolbar
        title="Report"
        description="Submit data issues or request shade corrections · session demo"
      />
      <div className="grid gap-6 p-5 lg:grid-cols-[320px_1fr]">
        <form
          className="space-y-4 rounded-md border bg-card p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setReports((prev) => [
              {
                id: crypto.randomUUID(),
                product: String(data.get("product")),
                description: String(data.get("description")),
                date: new Date().toLocaleDateString(),
              },
              ...prev,
            ]);
            event.currentTarget.reset();
            toast.success("Report added locally", {
              description: "No report was sent to a server.",
            });
          }}
        >
          <h2 className="text-sm font-medium">Submit a report</h2>
          <label className="grid gap-2 text-xs">
            Report type
            <select name="type" className="h-8 rounded-md border bg-card px-2">
              <option>Data issue</option>
              <option>Shade correction</option>
            </select>
          </label>
          <label className="grid gap-2 text-xs">
            Brand
            <Input name="brand" required />
          </label>
          <label className="grid gap-2 text-xs">
            Product name
            <Input name="product" required />
          </label>
          <label className="grid gap-2 text-xs">
            Shade or SKU
            <Input name="shade" required />
          </label>
          <label className="grid gap-2 text-xs">
            Issue description
            <Textarea name="description" required minLength={10} />
          </label>
          <label className="grid gap-2 text-xs">
            Supporting reference URL
            <Input type="url" name="reference" />
          </label>
          <Button type="submit" className="w-full">
            Submit report
          </Button>
        </form>
        <section>
          <h2 className="mb-4 text-sm font-medium">Submitted reports</h2>
          {!reports.length ? (
            <EmptyState
              title="No reports submitted"
              description="Your reports will appear here during this session."
            />
          ) : (
            reports.map((report) => (
              <article
                key={report.id}
                className="mb-3 rounded-md border bg-card p-4 text-xs"
              >
                <div className="flex justify-between">
                  <strong className="font-medium">{report.product}</strong>
                  <StatusBadge status="Pending" />
                </div>
                <p className="my-2 text-muted-foreground">
                  {report.description}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {report.date} · Local only
                </p>
              </article>
            ))
          )}
        </section>
      </div>
    </PageShell>
  );
}
