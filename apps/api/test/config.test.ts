import { test } from "node:test";
import assert from "node:assert/strict";
import { serverConfig, webOrigin } from "../src/config/env.js";
test("API address uses environment values and PORT may override APP_PORT", () => {
  assert.deepEqual(serverConfig({ HOST: "localhost", APP_PORT: "8088" }), {
    host: "localhost",
    port: 8088,
  });
  assert.deepEqual(
    serverConfig({
      HOST: "custom-api.internal",
      APP_PORT: "8088",
      PORT: "9001",
    }),
    { host: "custom-api.internal", port: 9001 },
  );
});
test("API address rejects missing configuration and invalid ports", () => {
  assert.throws(() => serverConfig({ APP_PORT: "8088" }), /HOST/);
  assert.throws(() => serverConfig({ HOST: "localhost" }), /APP_PORT/);
  for (const value of ["0", "65536", "NaN", "2.5"])
    assert.throws(
      () => serverConfig({ HOST: "localhost", APP_PORT: value }),
      /integer/,
    );
});
test("CORS origin comes from environment and requires an HTTP origin", () => {
  assert.equal(
    webOrigin({ WEB_ORIGIN: "https://frontend.example.com" }),
    "https://frontend.example.com",
  );
  assert.throws(() => webOrigin({}), /WEB_ORIGIN/);
  for (const value of [
    "invalid",
    "ftp://example.com",
    "https://example.com/path",
  ])
    assert.throws(() => webOrigin({ WEB_ORIGIN: value }), /WEB_ORIGIN/);
});
