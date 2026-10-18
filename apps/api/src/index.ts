import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { sampleItemRoutes } from "#api/presentation/http/routes/sample-item-routes.js";

const app = new Hono();

app.use("/api/*", cors());
app.get("/health", (context) => context.json({ status: "ok" }));
app.route("/api/sample-items", sampleItemRoutes);

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`API running at http://localhost:${info.port}`);
});
