import type { UserAccount, UserPatch } from "@color-bank-hub/contracts/user";
import { get, patch } from "@/lib/http";

export function getUsers(signal?: AbortSignal) {
  return get<UserAccount[]>("/users", {}, signal);
}

export function updateUser(id: string, changes: UserPatch) {
  return patch<UserAccount>(`/users/${id}`, changes);
}
