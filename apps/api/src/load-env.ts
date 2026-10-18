import fs from "node:fs";
import path from "node:path";

export function loadEnv() {
  const rootEnv = path.resolve(import.meta.dirname, "../../../.env");
  if (fs.existsSync(rootEnv)) {
    process.loadEnvFile(rootEnv);
  }

  const localEnv = path.resolve(import.meta.dirname, "../../.env");
  if (fs.existsSync(localEnv)) {
    process.loadEnvFile(localEnv);
  }
}
