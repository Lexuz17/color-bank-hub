import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "#api/lib/auth.js";
import { env } from "./env";
const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: env.webOrigin,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.get("/health", (context) => context.json({ status: "ok" }));

app.all("/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/api/me", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  return c.json(session.user);
});

serve({ fetch: app.fetch, port: env.port, hostname: env.host }, (info) => {
  console.log(`API running at http://${info.address}:${info.port}`);
});
