import {
  can,
  isRole,
  type Permission,
  type Role,
} from "@color-bank-hub/contracts/rbac";
import { redirect } from "@tanstack/react-router";

export function roleOf(user?: { role?: string | null } | null): Role | null {
  const role = user?.role;
  return isRole(role) ? role : null;
}

/** Route guard for `beforeLoad`: sends users without the permission home. */
export function assertCan(
  user: { role?: string | null } | null | undefined,
  permission: Permission,
) {
  if (!can(roleOf(user), permission)) throw redirect({ to: "/" });
}
