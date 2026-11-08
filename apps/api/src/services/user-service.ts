import type { UserPatch } from "@color-bank-hub/contracts/user";
import { fail } from "#api/core/errors.js";
import * as repository from "#api/repositories/user-repository.js";

export const listUsers = () => repository.listUsers();

export async function updateUser(
  id: string,
  input: UserPatch,
  actorId: string,
) {
  if (!input.role && !input.status)
    fail("BAD_REQUEST", "Nothing to update", "EMPTY_UPDATE");
  // Stops an admin from removing their own access.
  if (id === actorId)
    fail(
      "BUSINESS_RULE",
      "You cannot change your own account",
      "CANNOT_CHANGE_SELF",
    );

  const user = await repository.findUser(id);
  if (!user) fail("NOT_FOUND", "User not found", "USER_NOT_FOUND");
  if (input.status === "active" && !(input.role ?? user.role))
    fail("BUSINESS_RULE", "Assign a role before approving", "ROLE_REQUIRED");

  return repository.updateUser(id, user, input, actorId);
}
