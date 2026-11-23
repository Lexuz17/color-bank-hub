import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiError } from "@/lib/api-error";
import { commitDataInput, previewDataInput } from "../api/data-input.api";

export function usePreviewDataInput() {
  return useMutation({
    mutationFn: previewDataInput,
    onError: (error) => toast.error(apiError(error)),
  });
}

export function useCommitDataInput() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commitDataInput,
    onSuccess: async (result) => {
      await Promise.all(["shades", "product-formats", "brands", "products"].map((name) => queryClient.invalidateQueries({ queryKey: [name] })));
      toast.success(`${result.imported} shades imported`);
    },
    onError: (error) => toast.error(apiError(error)),
  });
}
