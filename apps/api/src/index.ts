import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { env } from "./env.js";

const app = createApp();

serve({ fetch: app.fetch, port: env.port, hostname: env.host }, (info) => {
  console.log(`API running at http://${info.address}:${info.port}`);
});
