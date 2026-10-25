import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../index.js";
import { accounts, users } from "../schema/index.js";

export const DEV_PASSWORD = "devpassword123"; // Keep in sync with the development login form.

const devUsers = [
  { name: "Dev Admin", email: "admin@dev.local", role: "website_admin" },
  { name: "Dev RnD", email: "rnd@dev.local", role: "rnd" },
  { name: "Dev PID", email: "pid@dev.local", role: "pid" },
  { name: "Dev TSI", email: "tsi@dev.local", role: "tsi" },
] as const;

export async function seedDevUsers() {
  const password = await hashPassword(DEV_PASSWORD);

  for (const { name, email, role } of devUsers) {
    const [user] = await db
      .insert(users)
      .values({ name, email, role, status: "active", emailVerified: true })
      .onConflictDoUpdate({
        target: users.email,
        set: { role, status: "active", emailVerified: true },
      })
      .returning({ id: users.id });

    if (!user) throw new Error(`Failed to create user ${email}`);

    // Replace an existing credential account with the development password.
    await db
      .delete(accounts)
      .where(
        and(
          eq(accounts.userId, user.id),
          eq(accounts.providerId, "credential"),
        ),
      );
    await db.insert(accounts).values({
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password,
    });

    console.log(`ok: ${email} (${role})`);
  }
}
