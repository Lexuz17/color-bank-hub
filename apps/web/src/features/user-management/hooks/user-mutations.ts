import type { UserPatch } from "@color-bank-hub/contracts/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiError } from "@/services/api-error";
import { updateUser } from "../api/users.api";
import { usersQueryOptions } from "./user-queries";

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UserPatch }) =>
      updateUser(id, changes),
    onSuccess: () => {
      toast.success("User updated");
      return queryClient.invalidateQueries({
        queryKey: usersQueryOptions.queryKey,
      });
    },
    onError: (error) => toast.error(apiError(error)),
  });
}
