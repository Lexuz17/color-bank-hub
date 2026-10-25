import fs from "node:fs";
import path from "node:path";

const envFiles = [
  path.resolve(import.meta.dirname, "../.env"), // apps/api/.env
  path.resolve(import.meta.dirname, "../../../.env"), // root monorepo
];

for (const file of envFiles) {
  if (fs.existsSync(file)) {
    process.loadEnvFile(file);
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Env ${name} wajib diisi`);
  }
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

const devAuth = process.env.DEV_AUTH === "true";

if (devAuth && process.env.NODE_ENV === "production") {
  throw new Error("DEV_AUTH tidak boleh aktif di production");
}

if (devAuth) {
  console.warn("[env] DEV_AUTH aktif: login email+password untuk dev menyala");
}

export const env = {
  port: Number(process.env.APP_PORT || process.env.PORT || 3000),
  host: process.env.HOST || "0.0.0.0",
  devAuth,
  betterAuthUrl: required("BETTER_AUTH_URL"),
  betterAuthSecret: required("BETTER_AUTH_SECRET"),
  webOrigin: required("WEB_ORIGIN"),
  allowedEmailDomain: required("ALLOWED_EMAIL_DOMAIN"),
  googleClientId: devAuth
    ? optional("GOOGLE_CLIENT_ID")
    : required("GOOGLE_CLIENT_ID"),
  googleClientSecret: devAuth
    ? optional("GOOGLE_CLIENT_SECRET")
    : required("GOOGLE_CLIENT_SECRET"),
};
