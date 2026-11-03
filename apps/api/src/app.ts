import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import { requestId } from "hono/request-id";
import { catalogRoutes } from "#api/routes/catalog-routes.js";
import { uploadRoutes } from "#api/routes/upload-routes.js";
import { userRoutes } from "#api/routes/user-routes.js";
import { workflowRoutes } from "#api/routes/workflow-routes.js";
import { env } from "#api/env.js";
import { auth } from "#api/lib/auth.js";
import {
  type AppEnv,
  type ResolveUser,
  requireAuth,
} from "#api/middleware/auth.js";
import { AppError } from "#api/core/errors.js";

type Ctx = Context<AppEnv>;

function sendError(
  c: Ctx,
  { code, reason, message, issues, status }: AppError,
) {
  return c.json(
    {
      error: {
        code,
        ...(reason ? { reason } : {}),
        message,
        requestId: c.get("requestId"),
        ...(issues ? { issues } : {}),
      },
    },
    status,
  );
}

/** Maps any thrown value to a safe client error; unknown errors become INTERNAL. */
function toAppError(error: Error, c: Ctx) {
  if (error instanceof AppError) return error;
  if (error instanceof SyntaxError)
    return new AppError(
      "BAD_REQUEST",
      "Request body must be valid JSON",
      "INVALID_JSON",
    );
  const dbCode =
    (error as { cause?: { code?: string }; code?: string }).cause?.code ??
    (error as { code?: string }).code;
  if (dbCode === "23505")
    return new AppError(
      "CONFLICT",
      "A record with this unique value already exists",
      "UNIQUE_VIOLATION",
    );
  if (dbCode === "23503")
    return new AppError(
      "BUSINESS_RULE",
      "A referenced record does not exist",
      "INVALID_REFERENCE",
    );
  console.error("API request failed", {
    requestId: c.get("requestId"),
    method: c.req.method,
    path: c.req.path,
    name: error.name,
    code: dbCode,
    message: error.message,
  });
  return new AppError("INTERNAL", "Unable to process the request");
}

export function createApp(options: { resolveUser?: ResolveUser } = {}) {
  const app = new Hono<AppEnv>();
  app.use(requestId());
  app.use(
    "/api/*",
    cors({
      origin: env.webOrigin,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    }),
  );
  app.use(
    "/api/*",
    bodyLimit({
      maxSize: 2 * 1024 * 1024,
      onError: (c) =>
        sendError(
          c,
          new AppError("PAYLOAD_TOO_LARGE", "Request body exceeds 2 MB"),
        ),
    }),
  );
  app.get("/health", (c) => c.json({ status: "ok" }));
  app.all("/api/auth/*", (c) => auth.handler(c.req.raw));
  // Everything below requires an active, signed-in user.
  app.use("/api/*", requireAuth(options.resolveUser));
  app.get("/api/me", (c) => c.json({ data: c.get("user") }));
  app.route("/api", catalogRoutes);
  app.route("/api", workflowRoutes);
  app.route("/api", uploadRoutes);
  app.route("/api", userRoutes);
  app.notFound((c) =>
    sendError(
      c,
      new AppError("NOT_FOUND", "Endpoint not found", "ROUTE_NOT_FOUND"),
    ),
  );
  app.onError((error, c) => sendError(c, toAppError(error, c)));
  return app;
}
