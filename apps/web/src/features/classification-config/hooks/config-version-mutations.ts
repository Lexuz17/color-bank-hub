import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiError } from "@/lib/api-error";
import { activateConfigVersion, createConfigVersion } from "../api/config-versions.api";

export function useCreateConfigVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createConfigVersion,
    onSuccess: async (version) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["classification-configs"] }),
        queryClient.invalidateQueries({ queryKey: ["shades"] }),
      ]);
      toast.success(`Version ${version.version} saved and active`);
    },
    onError: (error) => toast.error(apiError(error)),
  });
}

export function useActivateConfigVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateConfigVersion,
    onSuccess: async (version) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["classification-configs"] }),
        queryClient.invalidateQueries({ queryKey: ["shades"] }),
      ]);
      toast.success(`Version ${version.version} is active again`);
    },
    onError: (error) => toast.error(apiError(error)),
  });
}
