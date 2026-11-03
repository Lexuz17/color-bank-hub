import { users } from "@color-bank-hub/db";
import { desc, eq } from "drizzle-orm";
import { db } from "#api/lib/db.js";

export function listUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      status: users.status,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function updateLastLogin(userId: string) {
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, userId));
}
