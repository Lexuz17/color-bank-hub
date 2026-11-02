import { can, type Permission } from "@color-bank-hub/contracts/rbac";
import { roleOf } from "../rbac";
import { useSession } from "./use-session";

export function useCurrentUser() {
  const { data } = useSession();
  return { name: data?.user.name ?? "", role: roleOf(data?.user) };
}

/** UI-only check for hiding actions; the API enforces the same matrix. */
export function useCan(permission: Permission) {
  return can(useCurrentUser().role, permission);
}
