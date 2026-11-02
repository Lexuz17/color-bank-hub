import {
  can,
  isRole,
  type Permission,
  type Role,
} from "@color-bank-hub/contracts/rbac";
import { createMiddleware } from "hono/factory";
import type { RequestIdVariables } from "hono/request-id";
import { fail } from "#api/core/errors.js";
import { auth } from "#api/lib/auth.js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
export type AppEnv = { Variables: { user: AuthUser } & RequestIdVariables };

/** Resolves the signed-in user from request headers; null means anonymous. */
export type ResolveUser = (headers: Headers) => Promise<AuthUser | null>;

const resolveSessionUser: ResolveUser = async (headers) => {
  const session = await auth.api.getSession({ headers });
  if (!session) return null;
  const { id, email, name, role, status } = session.user;
  if (status !== "active" || !isRole(role))
    fail(
      "FORBIDDEN",
      "Your account is waiting for approval",
      "ACCOUNT_INACTIVE",
    );
  return { id, email, name, role };
};

export const requireAuth = (resolveUser: ResolveUser = resolveSessionUser) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const user = await resolveUser(c.req.raw.headers);
    if (!user) fail("UNAUTHORIZED", "Sign in to continue");
    c.set("user", user);
    await next();
  });

export const requirePermission = (permission: Permission) =>
  createMiddleware<AppEnv>(async (c, next) => {
    if (!can(c.get("user").role, permission))
      fail(
        "FORBIDDEN",
        "You do not have permission for this action",
        "MISSING_PERMISSION",
      );
    await next();
  });
