import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PrototypeRequest, RequestStatus } from "@/types/api";
import { api, apiError } from "@/services/color-bank-api";
import {
  ShadeSwatch,
  WorkflowSteps,
} from "@/components/shared/workspace-components";
import { ApiError } from "./api-feedback";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
const stages = ["pending", "approved", "formulating", "completed"] as const;
export function PrototypeDetail({
  request,
  formatName,
}: {
  request: PrototypeRequest;
  formatName: string;
}) {
  const client = useQueryClient();
  const [confirm, setConfirm] = useState<Exclude<
    RequestStatus,
    "pending"
  > | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [photo, setPhoto] = useState(request.resultPhotoUrl ?? "");
  const [notes, setNotes] = useState(request.resultNotes ?? "");
  const [ingredients, setIngredients] = useState(request.ingredientsInci ?? "");
  const [composition, setComposition] = useState(
    JSON.stringify(request.composition ?? [], null, 2),
  );
  const [compositionError, setCompositionError] = useState("");
  async function refresh() {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["requests"] }),
      client.invalidateQueries({ queryKey: ["request", request.id] }),
    ]);
  }
  const transition = useMutation({
    mutationFn: ({
      status,
      reason,
    }: {
      status: Exclude<RequestStatus, "pending">;
      reason?: string;
    }) => api.transitionRequest(request.id, status, reason),
    onSuccess: async () => {
      setConfirm(null);
      await refresh();
      toast.success("Request updated");
    },
    onError: (error) => toast.error(apiError(error)),
  });
  const save = useMutation({
    mutationFn: api.saveFormulation.bind(null, request.id),
    onSuccess: async () => {
      await refresh();
      toast.success("Formulation saved");
    },
    onError: (error) => toast.error(apiError(error)),
  });
  return (
    <section className="space-y-4 p-5">
      <h2 className="text-sm font-medium">
        {request.shadeNameNew || "Prototype request"}
      </h2>
      <p className="text-[11px] text-muted-foreground">
        {request.brandNameNew} · {request.productNameNew}
      </p>
      {request.targetHex && <ShadeSwatch hex={request.targetHex} size="lg" />}
      <p className="text-xs text-muted-foreground">
        Target {request.targetHex || "not provided"} · {formatName}
      </p>
      {request.status !== "declined" ? (
        <WorkflowSteps
          activeStep={Math.max(0, stages.indexOf(request.status))}
          completed={request.status === "completed"}
        />
      ) : (
        <p className="rounded-md bg-muted p-3 text-xs">
          Declined: {request.declineReason}
        </p>
      )}
      <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
        {request.description}
      </p>
      <p className="text-[10px] text-muted-foreground">
        {request.priority} priority ·{" "}
        {new Date(request.createdAt).toLocaleDateString()}
      </p>
      {request.status === "pending" && (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              transition.reset();
              setConfirm("declined");
            }}
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={() => {
              transition.reset();
              setConfirm("approved");
            }}
          >
            Approve request
          </Button>
        </div>
      )}
      {request.status === "approved" && (
        <Button
          disabled={transition.isPending}
          onClick={() => transition.mutate({ status: "formulating" })}
        >
          Start formulation
        </Button>
      )}
      {request.status === "formulating" && (
        <form
          className="space-y-4 border-t pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            setCompositionError("");
            let parsed: unknown;
            try {
              parsed = JSON.parse(composition);
              if (
                !Array.isArray(parsed) ||
                !parsed.every(
                  (item) =>
                    item &&
                    typeof item.name === "string" &&
                    typeof item.percentage === "number",
                )
              )
                throw new Error();
            } catch {
              setCompositionError(
                'Use an array of {"name":"Colorant","percentage":10} entries.',
              );
              return;
            }
            save.mutate({
              ...(photo.trim() ? { resultPhotoUrl: photo.trim() } : {}),
              resultNotes: notes,
              ingredientsInci: ingredients,
              composition: parsed as { name: string; percentage: number }[],
            });
          }}
        >
          <label className="grid gap-2 text-xs">
            Result photo URL
            <Input
              type="url"
              pattern="https?://.*"
              value={photo}
              onChange={(event) => setPhoto(event.target.value)}
              placeholder="https://…"
            />
          </label>
          <p className="text-[10px] text-muted-foreground">
            Use a hosted image URL. Image file storage is not configured.
          </p>
          <label className="grid gap-2 text-xs">
            Ingredients
            <Textarea
              value={ingredients}
              onChange={(event) => setIngredients(event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-xs">
            Color composition (JSON)
            <Textarea
              value={composition}
              onChange={(event) => setComposition(event.target.value)}
              className="font-mono text-[10px]"
            />
          </label>
          {compositionError && (
            <p role="alert" className="text-xs text-destructive">
              {compositionError}
            </p>
          )}
          <label className="grid gap-2 text-xs">
            Result notes
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
          {save.isError && <ApiError error={save.error} />}
          <Button type="submit" size="sm" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save formulation"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={save.isPending || !request.resultPhotoUrl}
            onClick={() => {
              transition.reset();
              setConfirm("completed");
            }}
          >
            Mark result uploaded
          </Button>
          {!request.resultPhotoUrl && (
            <p className="text-[10px] text-muted-foreground">
              Save a result photo URL before completing this request.
            </p>
          )}
        </form>
      )}
      {request.status === "completed" && (
        <div className="space-y-3 border-t pt-3">
          {request.resultPhotoUrl && (
            <a
              href={request.resultPhotoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary underline"
            >
              View uploaded result
            </a>
          )}
          <p className="whitespace-pre-wrap text-xs">{request.resultNotes}</p>
        </div>
      )}
      {transition.isError && !confirm && <ApiError error={transition.error} />}
      <Dialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open && !transition.isPending) setConfirm(null);
        }}
      >
        <DialogContent className="gap-3">
          <DialogHeader>
            <DialogTitle>
              {confirm === "declined"
                ? "Decline request?"
                : confirm === "completed"
                  ? "Mark result uploaded?"
                  : "Approve request?"}
            </DialogTitle>
            <DialogDescription>
              {request.brandNameNew} · {request.productNameNew} ·{" "}
              {request.shadeNameNew}
            </DialogDescription>
          </DialogHeader>
          {confirm === "declined" && (
            <label className="grid gap-2 text-xs">
              Reason
              <Textarea
                value={declineReason}
                onChange={(event) => setDeclineReason(event.target.value)}
                maxLength={2000}
              />
            </label>
          )}
          {transition.isError && <ApiError error={transition.error} />}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={transition.isPending}
              onClick={() => setConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={
                transition.isPending ||
                (confirm === "declined" && !declineReason.trim())
              }
              onClick={() => {
                if (confirm)
                  transition.mutate({
                    status: confirm,
                    ...(confirm === "declined"
                      ? { reason: declineReason.trim() }
                      : {}),
                  });
              }}
            >
              {transition.isPending ? "Updating…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
