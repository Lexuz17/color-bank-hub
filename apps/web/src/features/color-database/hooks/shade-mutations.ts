import type { ShadePatch } from "@color-bank-hub/contracts/shade";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiError } from "@/lib/api-error";
import { updateShade } from "../api/shades.api";

export function useUpdateShade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShadePatch }) =>
      updateShade(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shades"] });
      toast.success("Shade updated");
    },
    onError: (error) => toast.error(apiError(error)),
  });
}
