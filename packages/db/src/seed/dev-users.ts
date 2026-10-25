import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../index";
import { accounts, users } from "../schema/index";

export const DEV_PASSWORD = "devpassword123"; // Make sure it's the same as devLogin.

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

    if (!user) throw new Error(`Gagal membuat user ${email}`);

    // Ganti akun credential lama (kalau ada) dengan yang baru
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
