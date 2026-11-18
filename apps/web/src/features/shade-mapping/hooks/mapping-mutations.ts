import type { MappingInput } from "@color-bank-hub/contracts/mapping";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiError } from "@/lib/api-error";
import { createMapping, updateMapping } from "../api/mappings.api";

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

export function useUpdateMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MappingInput }) => updateMapping(id, input),
    onSuccess: async (mapping) => {
      await queryClient.invalidateQueries({ queryKey: ["mappings"] });
      toast.success(`Saved "${mapping.name}"`);
    },
    onError: (error) => toast.error(apiError(error)),
  });
}
