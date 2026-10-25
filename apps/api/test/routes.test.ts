import { loadEnv } from "../src/load-env.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
loadEnv();
const app = createApp();
async function request(path: string, method = "GET", body?: unknown) {
  return app.request(path, {
    method,
    ...(body === undefined
      ? {}
      : {
          headers: { "content-type": "application/json" },
          body: typeof body === "string" ? body : JSON.stringify(body),
        }),
  });
}
test("health is explicit about the prototype and unknown endpoints return structured errors", async () => {
  const health = await request("/health");
  assert.equal(health.status, 200);
  assert.equal((await health.json()).authentication, false);
  const missing = await request("/api/missing");
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error.code, "NOT_FOUND");
});
test("catalog validation rejects bad pagination and IDs before database access", async () => {
  for (const path of [
    "/api/shades?page=0",
    "/api/shades?pageSize=501",
    "/api/shades?sort=unsafe",
    "/api/shades/not-a-uuid",
  ]) {
    const response = await request(path);
    assert.equal(response.status, 422, path);
    assert.equal((await response.json()).error.code, "VALIDATION_ERROR");
  }
});
test("write endpoints reject malformed JSON and invalid or mass-assignment input", async () => {
  assert.equal((await request("/api/reports", "POST", "{")).status, 400);
  for (const [path, body] of [
    ["/api/reports", { description: "short" }],
    ["/api/shades", { name: "Shade", hex: "invalid" }],
    ["/api/products", { name: "Product" }],
    ["/api/brands", { name: "Brand", createdBy: "spoof" }],
    ["/api/prototype-requests", { status: "approved" }],
    ["/api/imports/preview", { rows: [] }],
    ["/api/imports/commit", { rows: Array(501).fill({}) }],
  ] as const) {
    const response = await request(path, "POST", body);
    assert.equal(response.status, 422, path);
  }
});
test("status and formulation endpoints validate status, composition, and IDs", async () => {
  const id = "818565f8-bc7f-4c65-bd17-331c2e1d3986";
  for (const [path, body] of [
    [`/api/prototype-requests/${id}/status`, { status: "declined" }],
    [`/api/prototype-requests/${id}/status`, { status: "pending" }],
    [`/api/prototype-requests/${id}/formulation`, {}],
    [`/api/reports/${id}`, { status: "approved" }],
    ["/api/shades/not-uuid", { hex: "#aa6d78" }],
  ] as const) {
    assert.equal((await request(path, "PATCH", body)).status, 422, path);
  }
});
