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
  const apiPort = env.APP_PORT || env.PORT || "3000";

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
      proxy: {
        "/api": `http://localhost:${apiPort}`,
      },
    },
  };
});
