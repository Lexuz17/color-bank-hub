import { useQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "./auth-queries";

export function useSession() {
  return useQuery(sessionQueryOptions);
}
