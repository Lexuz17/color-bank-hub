function required(name: string, env: NodeJS.ProcessEnv) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} must be configured in .env`);
  return value;
}
export function serverConfig(env: NodeJS.ProcessEnv = process.env) {
  const host = required("HOST", env);
  const port = Number(env.PORT?.trim() || required("APP_PORT", env));
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT / APP_PORT must be an integer between 1 and 65535");
  return { host, port };
}
export function webOrigin(env: NodeJS.ProcessEnv = process.env) {
  const value = required("WEB_ORIGIN", env);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("WEB_ORIGIN must be a valid HTTP or HTTPS origin");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.origin !== value)
    throw new Error(
      "WEB_ORIGIN must be an HTTP or HTTPS origin without a path",
    );
  return value;
}
