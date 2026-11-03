import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { env } from "./env.js";
import { db } from "./lib/db.js";

try {
  await db.$client`select 1`;
} catch (error) {
  const host = new URL(env.databaseUrl).host;
  console.error(
    `Cannot connect to the database at ${host}: ${(error as Error).message || (error as { code?: string }).code}`,
  );
  console.error("Start it with `docker compose up -d db`, then retry.");
  process.exit(1);
}

const app = createApp();

serve({ fetch: app.fetch, port: env.port, hostname: env.host }, (info) => {
  console.log(`API running at http://${info.address}:${info.port}`);
});
