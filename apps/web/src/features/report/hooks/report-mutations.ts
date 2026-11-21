import type { UpdateReportRequest } from "@color-bank-hub/contracts/report";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiError } from "@/lib/api-error";
import { createReport, updateReport } from "../api/reports.api";

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReport,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report submitted");
    },
    onError: (error) => toast.error(apiError(error)),
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateReportRequest }) => updateReport(id, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report status updated");
    },
    onError: (error) => toast.error(apiError(error)),
  });
}
