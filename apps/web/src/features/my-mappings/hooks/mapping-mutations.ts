import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiError } from "@/lib/api-error";
import { createFolder, deleteFolder, deleteMapping, moveToFolder, renameFolder } from "../api/mappings.api";

export function useDeleteMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMapping,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mappings"] });
      toast.success("Mapping deleted");
    },
    onError: (error) => toast.error(apiError(error)),
  });
}

export function useMoveToFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, folderId }: { id: string; folderId: string | null }) => moveToFolder(id, folderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mappings"] });
      toast.success("Mapping moved");
    },
    onError: (error) => toast.error(apiError(error)),
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFolder,
    onSuccess: async (folder) => {
      await queryClient.invalidateQueries({ queryKey: ["mappings"] });
      toast.success(`Folder "${folder.name}" created`);
    },
    onError: (error) => toast.error(apiError(error)),
  });
}

export function useRenameFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameFolder(id, { name }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mappings"] });
      toast.success("Folder renamed");
    },
    onError: (error) => toast.error(apiError(error)),
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mappings"] });
      toast.success("Folder deleted. Its mappings are back in Mine.");
    },
    onError: (error) => toast.error(apiError(error)),
  });
}
