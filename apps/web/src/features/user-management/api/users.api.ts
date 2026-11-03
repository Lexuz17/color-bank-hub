import type { UserAccount } from "@color-bank-hub/contracts/user";
import { get } from "@/services/http";

export function getUsers(signal?: AbortSignal) {
  return get<UserAccount[]>("/users", {}, signal);
}
