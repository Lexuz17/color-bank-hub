import { queryOptions } from "@tanstack/react-query";
import { authClient } from "../api/auth-client";

export const sessionQueryOptions = queryOptions({
  queryKey: ["auth", "session"],
  queryFn: async () => {
    const { data, error } = await authClient.getSession();
    if (error) throw error;
    return data;
  },
  staleTime: 60_000,
});
