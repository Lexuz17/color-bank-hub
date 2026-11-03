import { useQuery } from "@tanstack/react-query";
import { usersQueryOptions } from "./user-queries";

export function useUsers() {
  return useQuery(usersQueryOptions);
}
