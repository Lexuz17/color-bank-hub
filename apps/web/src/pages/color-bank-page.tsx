import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageToolbar,
  ShadeSwatch,
  StatusBadge,
  WorkflowSteps,
} from "@/components/shared/workspace-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
const seed = [
  {
    id: "PRO-001",
    name: "Rosewood gap filling",
    hex: "#aa6d78",
    status: "Pending" as const,
  },
  {
    id: "PRO-002",
    name: "Warm peach benchmark",
    hex: "#fc8877",
    status: "Formulating" as const,
  },
];
export function ColorBankPage() {
  const [format, setFormat] = useState("Lip Tint Gloss");
  const [requests, setRequests] =
    useState<
      {
        id: string;
        name: string;
        hex: string;
        status: "Pending" | "Approved" | "Formulating" | "Result uploaded";
      }[]
    >(seed);
  const [active, setActive] = useState("PRO-001");
  const [open, setOpen] = useState(false);
  const request = requests.find((item) => item.id === active)!;
  const stages = [
    "Pending",
    "Approved",
    "Formulating",
    "Result uploaded",
  ] as const;
  const detailPanel = (
    <section className="space-y-4 p-5">
      <h2 className="text-sm font-medium">{request.name}</h2>
      <ShadeSwatch hex={request.hex} size="lg" />
      <p className="text-xs text-muted-foreground">
        Target {request.hex} · {format}
      </p>
      <WorkflowSteps activeStep={stages.indexOf(request.status)} />
      <p className="text-xs text-muted-foreground">
        Demonstration request workflow. Changes last for this session.
      </p>
      {request.status !== "Result uploaded" && (
        <Button
          onClick={() => {
            setRequests((prev) =>
              prev.map((item) =>
                item.id === active
                  ? {
                      ...item,
                      status: stages[stages.indexOf(item.status) + 1],
                    }
                  : item,
              ),
            );
            toast.success("Demo request updated");
          }}
        >
          {request.status === "Pending"
            ? "Approve request"
            : request.status === "Approved"
              ? "Start formulation"
              : "Mark result uploaded"}
        </Button>
      )}
    </section>
  );
  return (
    <PageShell
      section="Color Bank"
      format={format}
      onFormatChange={setFormat}
      detailPanel={detailPanel}
    >
      <PageToolbar
        title="Color Bank"
        description="Prototype shade requests · session demo"
      >
        <Button onClick={() => setOpen(true)}>+ New request</Button>
      </PageToolbar>
      <div>
        <div>
          {requests.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={`flex w-full flex-wrap items-center gap-3 border-b p-4 text-left text-xs ${active === item.id ? "bg-accent" : "hover:bg-muted"}`}
            >
              <ShadeSwatch hex={item.hex} />
              <div className="flex-1">
                <strong className="font-medium">{item.id}</strong>
                <p className="mt-1 text-muted-foreground">{item.name}</p>
              </div>
              <StatusBadge status={item.status} />
            </button>
          ))}
        </div>
        <div className="border-t xl:hidden">{detailPanel}</div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New prototype request</DialogTitle>
            <DialogDescription>
              Create a local demonstration request.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const item = {
                id: `PRO-${crypto.randomUUID().slice(0, 6)}`,
                name: String(data.get("name")),
                hex: String(data.get("hex")),
                status: "Pending" as const,
              };
              setRequests((prev) => [item, ...prev]);
              setActive(item.id);
              setOpen(false);
              toast.success("Request added to this session");
            }}
          >
            <label className="grid gap-2 text-xs">
              Request name
              <Input name="name" required />
            </label>
            <label className="grid gap-2 text-xs">
              Target HEX
              <Input
                name="hex"
                defaultValue="#aa6d78"
                pattern="#[0-9a-fA-F]{6}"
                title="A six-digit HEX code, for example #aa6d78"
                required
              />
            </label>
            <label className="grid gap-2 text-xs">
              Notes
              <Textarea name="notes" />
            </label>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
