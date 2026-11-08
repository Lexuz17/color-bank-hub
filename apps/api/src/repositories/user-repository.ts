import type { UserPatch } from "@color-bank-hub/contracts/user";
import { auditLogs, type User, users } from "@color-bank-hub/db";
import { desc, eq } from "drizzle-orm";
import { db } from "#api/lib/db.js";

const accountColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  image: users.image,
  role: users.role,
  status: users.status,
  lastLoginAt: users.lastLoginAt,
  createdAt: users.createdAt,
};

export function listUsers() {
  return db.select(accountColumns).from(users).orderBy(desc(users.createdAt));
}

export async function findUser(id: string) {
  const [user] = await db
    .select({ role: users.role, status: users.status })
    .from(users)
    .where(eq(users.id, id));
  return user;
}

export function updateUser(
  id: string,
  before: Pick<User, "role" | "status">,
  changes: UserPatch,
  actorId: string,
) {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(users)
      .set(changes)
      .where(eq(users.id, id))
      .returning(accountColumns);
    await tx.insert(auditLogs).values({
      actorId,
      action: "user.updated",
      targetType: "user",
      targetId: id,
      before,
      after: { role: row.role, status: row.status },
    });
    return row;
  });
}

export async function updateLastLogin(userId: string) {
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, userId));
}
