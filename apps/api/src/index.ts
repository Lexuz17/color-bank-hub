import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { loadEnv } from "#api/load-env.js";
import { sampleItemRoutes } from "#api/routes/sample-item-routes.js";

loadEnv();
const app = new Hono();

app.use("/api/*", cors());
app.get("/health", (context) => context.json({ status: "ok" }));
app.route("/api/sample-items", sampleItemRoutes);

const port = Number(process.env.PORT || process.env.APP_PORT || 3000);
const hostname = process.env.HOST || "0.0.0.0";

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(`API running at http://${info.address}:${info.port}`);
});
