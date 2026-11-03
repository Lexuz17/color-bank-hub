import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { schema } from "@color-bank-hub/db";
import { db } from "#api/lib/db.js";
import { env } from "#api/env.js";
import { updateLastLogin } from "#api/repositories/user-repository.js";

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
    session: {
      create: {
        after: (session) => updateLastLogin(session.userId),
      },
    },
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
