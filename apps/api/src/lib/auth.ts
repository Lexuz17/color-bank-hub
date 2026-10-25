import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db, schema } from "@color-bank-hub/db";
import { env } from "#api/env.js";

const socialProviders =
  env.googleClientId && env.googleClientSecret
    ? {
        google: {
          clientId: env.googleClientId,
          clientSecret: env.googleClientSecret,
        },
      }
    : {};

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema, usePlural: true }),
  baseURL: env.betterAuthUrl,
  secret: env.betterAuthSecret,
  trustedOrigins: [env.webOrigin],

  advanced: { database: { generateId: "uuid" } },

  emailAndPassword: { enabled: env.isDevelopment, disableSignUp: true },
  socialProviders,

  user: {
    additionalFields: {
      role: { type: "string", required: false, input: false },
      status: { type: "string", required: false, input: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (
            !user.email.toLowerCase().endsWith(`@${env.allowedEmailDomain}`)
          ) {
            throw new APIError("FORBIDDEN", {
              message: "Email domain not allowed",
            });
          }
          return { data: user };
        },
      },
    },
  },

  onAPIError: {
    errorURL: `${env.webOrigin}/login`,
  },
});
