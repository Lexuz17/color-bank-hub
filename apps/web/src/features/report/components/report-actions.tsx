import type { ReportResponse, ReportStatus } from "@color-bank-hub/contracts/report";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCan } from "@/features/auth/hooks/use-can";
import { useSession } from "@/features/auth/hooks/use-session";
import { useUpdateReport } from "../hooks/report-mutations";

interface Action {
  label: string;
  status: ReportStatus;
  variant: "default" | "outline" | "destructive-outline";
}

// Buttons only hide what the user cannot do; the API enforces who may make each move.
export function ReportActions({ report }: { report: ReportResponse }) {
  const isResolver = useCan("report:resolve");
  const isReporter = useSession().data?.user.id === report.reporter.id;
  const update = useUpdateReport();
  const [action, setAction] = useState<Action | null>(null);
  const [note, setNote] = useState("");

  const actions: Action[] = [];
  if (report.status === "pending" && isResolver)
    actions.push(
      { label: "Resolve", status: "resolved", variant: "default" },
      { label: "Reject", status: "rejected", variant: "destructive-outline" },
    );
  if (report.status === "resolved" && isReporter) actions.push({ label: "Confirm", status: "closed", variant: "default" });
  if ((report.status === "resolved" && (isReporter || isResolver)) || (report.status === "rejected" && isResolver)) {
    actions.push({ label: "Reopen", status: "pending", variant: "outline" });
  }
  if (actions.length === 0) return null;

  const close = () => {
    setAction(null);
    setNote("");
  };

  return (
    <>
      <div className="flex gap-2">
        {actions.map((item) => (
          <Button key={item.status} size="sm" variant={item.variant} onClick={() => setAction(item)}>
            {item.label}
          </Button>
        ))}
      </div>
      {action && (
        <Dialog open onOpenChange={(open) => !open && close()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{action.label} report</DialogTitle>
            </DialogHeader>
            <label className="block space-y-1.5 text-xs">
              Note
              <Textarea rows={4} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            <DialogFooter>
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button
                variant={action.variant === "destructive-outline" ? "destructive" : "default"}
                disabled={update.isPending}
                onClick={() =>
                  update.mutate({ id: report.id, request: { status: action.status, note: note.trim() || undefined } }, { onSuccess: close })
                }
              >
                {action.label}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
