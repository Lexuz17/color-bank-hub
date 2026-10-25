import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import { catalogRoutes } from "#api/routes/catalog-routes.js";
import { reportRoutes, prototypeRoutes } from "#api/routes/workflow-routes.js";
import { env } from "#api/env.js";
export function createApp() {
  const app = new Hono();
  app.use("/api/*", cors({ origin: env.webOrigin }));
  app.use(
    "/api/*",
    bodyLimit({
      maxSize: 2 * 1024 * 1024,
      onError: (c) =>
        c.json(
          {
            error: {
              code: "PAYLOAD_TOO_LARGE",
              message: "Request body exceeds 2 MB",
            },
          },
          413,
        ),
    }),
  );
  app.get("/health", (c) =>
    c.json({ status: "ok", mode: "local-prototype", authentication: false }),
  );
  app.route("/api", catalogRoutes);
  app.route("/api/reports", reportRoutes);
  app.route("/api/prototype-requests", prototypeRoutes);
  app.notFound((c) =>
    c.json(
      { error: { code: "NOT_FOUND", message: "Endpoint not found" } },
      404,
    ),
  );
  app.onError((error, c) => {
    const e = error as Error & {
      status?: 400 | 404 | 409 | 422;
      code?: string;
      issues?: unknown;
      cause?: { code?: string };
    };
    if (e.status && [400, 404, 409, 422].includes(e.status))
      return c.json(
        {
          error: {
            code: e.code ?? "BAD_REQUEST",
            message: e.message,
            ...(e.issues ? { issues: e.issues } : {}),
          },
        },
        e.status,
      );
    if (error instanceof SyntaxError)
      return c.json(
        {
          error: {
            code: "INVALID_JSON",
            message: "Request body must be valid JSON",
          },
        },
        400,
      );
    const dbCode = e.cause?.code ?? e.code;
    if (dbCode === "23505")
      return c.json(
        {
          error: {
            code: "CONFLICT",
            message: "A record with this unique value already exists",
          },
        },
        409,
      );
    if (dbCode === "23503")
      return c.json(
        {
          error: {
            code: "INVALID_REFERENCE",
            message: "A referenced record does not exist",
          },
        },
        422,
      );
    console.error("API request failed", { name: error.name, code: dbCode });
    return c.json(
      { error: { code: "INTERNAL", message: "Unable to process the request" } },
      500,
    );
  });
  return app;
}
