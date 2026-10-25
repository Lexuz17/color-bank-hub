import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = path.resolve(
    fileURLToPath(new URL(".", import.meta.url)),
    "../../",
  );
  const env = loadEnv(mode, envDir, "");
  const apiUrl = env.API_URL;
  const webHost = env.WEB_HOST;
  const webPort = Number(env.WEB_PORT);
  if (!apiUrl || !webHost || !env.VITE_API_BASE_URL)
    throw new Error(
      "Configure API_URL, WEB_HOST, WEB_PORT, and VITE_API_BASE_URL in .env",
    );
  if (!["http:", "https:"].includes(new URL(apiUrl).protocol))
    throw new Error("API_URL must use HTTP or HTTPS");
  if (!Number.isInteger(webPort) || webPort < 1 || webPort > 65535)
    throw new Error("WEB_PORT must be an integer between 1 and 65535");

  return {
    envDir,
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: webHost,
      port: webPort,
      strictPort: true,
      proxy: {
        "/api": apiUrl,
      },
    },
  };
});
