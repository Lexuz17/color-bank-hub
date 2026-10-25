// Biasa ini buat call api inquiry". pakai queryClient tanstack
import { queryOptions } from "@tanstack/react-query";
import { authClient } from "../api/auth-client";

// Setealh ini dibuat, nanti dipakai di pages/hooks lains.
export const sessionQueryOptions = queryOptions({
  queryKey: ["auth", "session"],
  queryFn: async () => {
    const { data, error } = await authClient.getSession();
    if (error) throw error;
    return data;
  },
  staleTime: 60_000,
});
