import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiError } from "@/lib/api-error";
import { createMapping } from "../api/mappings.api";

export function useCreateMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMapping,
    onSuccess: async (mapping) => {
      await queryClient.invalidateQueries({ queryKey: ["mappings"] });
      toast.success(`Saved "${mapping.name}"`);
    },
    onError: (error) => toast.error(apiError(error)),
  });
}
