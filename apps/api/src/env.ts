import fs from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";

// Load the monorepo env file for Turbo and direct package commands. Existing
// process variables take precedence, and Vite-only values stay out of process.env.
const rootEnv = path.resolve(import.meta.dirname, "../../../.env");
if (fs.existsSync(rootEnv)) {
  const fileEnv = parseEnv(fs.readFileSync(rootEnv, "utf8"));
  for (const [name, value] of Object.entries(fileEnv)) {
    if (name.startsWith("VITE_")) continue;
    if (process.env[name] === undefined) process.env[name] = value;
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

const isDevelopment = process.env.NODE_ENV === "development";

const port = Number(process.env.PORT || process.env.APP_PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT / APP_PORT must be an integer between 1 and 65535");
}

const googleClientId = optional("GOOGLE_CLIENT_ID");
const googleClientSecret = optional("GOOGLE_CLIENT_SECRET");
if (isDevelopment && Boolean(googleClientId) !== Boolean(googleClientSecret)) {
  throw new Error(
    "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together",
  );
}

export const env = {
  port,
  host: process.env.HOST || "0.0.0.0",
  isDevelopment,
  betterAuthUrl: required("BETTER_AUTH_URL"),
  betterAuthSecret: required("BETTER_AUTH_SECRET"),
  webOrigin: required("WEB_ORIGIN"),
  allowedEmailDomain: required("ALLOWED_EMAIL_DOMAIN"),
  googleClientId: isDevelopment ? googleClientId : required("GOOGLE_CLIENT_ID"),
  googleClientSecret: isDevelopment
    ? googleClientSecret
    : required("GOOGLE_CLIENT_SECRET"),
};
