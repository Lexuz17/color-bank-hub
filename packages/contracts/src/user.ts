import type { Role } from "./rbac.js";

export type UserStatus = "pending" | "active" | "disabled";

/** Row returned by GET /api/users. */
export interface UserAccount {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role | null; // until a Website Admin assigns one.
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
}
