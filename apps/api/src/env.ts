import { z } from "zod";

// Local scripts load the root .env with --env-file-if-exists; containers pass real env vars.
const isDevelopment = process.env.NODE_ENV === "development";

// Google OAuth is optional in development and required everywhere else.
const googleCredential = isDevelopment
  ? z.string().optional()
  : z.string().min(1);

const schema = z
  .object({
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    HOST: z.string().min(1).default("0.0.0.0"),
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    WEB_ORIGIN: z.url(),
    ALLOWED_EMAIL_DOMAIN: z.string().min(1),
    GOOGLE_CLIENT_ID: googleCredential,
    GOOGLE_CLIENT_SECRET: googleCredential,
  })
  .refine((value) => !value.GOOGLE_CLIENT_ID === !value.GOOGLE_CLIENT_SECRET, {
    message:
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together",
  });

const result = schema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
}
const value = result.data;

export const env = {
  isDevelopment,
  port: value.PORT,
  host: value.HOST,
  databaseUrl: value.DATABASE_URL,
  betterAuthUrl: value.BETTER_AUTH_URL,
  betterAuthSecret: value.BETTER_AUTH_SECRET,
  webOrigin: value.WEB_ORIGIN,
  allowedEmailDomain: value.ALLOWED_EMAIL_DOMAIN,
  googleClientId: value.GOOGLE_CLIENT_ID || undefined,
  googleClientSecret: value.GOOGLE_CLIENT_SECRET || undefined,
};
