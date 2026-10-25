import { randomUUID } from "node:crypto";
import { db, users } from "@color-bank-hub/db";
/** Satisfies existing foreign keys until real authentication is integrated. This is not an authenticated user. */
export async function developmentActorId() {
  const [actor] = await db
    .insert(users)
    .values({
      id: randomUUID(),
      name: "Development API placeholder",
      email: "development-api@color-bank.invalid",
      status: "disabled",
      role: null,
      emailVerified: false,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { name: "Development API placeholder" },
    })
    .returning({ id: users.id });
  return actor.id;
}
