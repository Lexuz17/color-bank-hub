import { z } from "zod";
import { type Role, roles } from "./rbac.js";

export type UserStatus = "pending" | "active" | "disabled";

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

export const userPatch = z
  .object({
    role: z.enum(roles).optional(),
    status: z.literal("active").optional(),
  })
  .strict();
export type UserPatch = z.infer<typeof userPatch>;
