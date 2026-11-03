import { queryOptions } from "@tanstack/react-query";
import { getUsers } from "../api/users.api";

export const usersQueryOptions = queryOptions({
  queryKey: ["users"],
  queryFn: ({ signal }) => getUsers(signal),
});
