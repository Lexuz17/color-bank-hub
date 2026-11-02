import { test } from "node:test";
import assert from "node:assert/strict";
import type { Role } from "@color-bank-hub/contracts/rbac";
import { createApp } from "../src/app.js";

const userWith = (role: Role) => ({
  id: "00000000-0000-4000-8000-000000000001",
  email: `${role}@test.invalid`,
  name: `Test ${role}`,
  role,
});
const app = createApp({ resolveUser: async () => userWith("website_admin") });
async function request(
  path: string,
  method = "GET",
  body?: unknown,
  target = app,
) {
  return target.request(path, {
    method,
    ...(body === undefined
      ? {}
      : {
          headers: { "content-type": "application/json" },
          body: typeof body === "string" ? body : JSON.stringify(body),
        }),
  });
}
test("health is public and unknown endpoints return structured errors", async () => {
  const health = await request(
    "/health",
    "GET",
    undefined,
    createApp({ resolveUser: async () => null }),
  );
  assert.equal(health.status, 200);
  const missing = await request("/api/missing");
  assert.equal(missing.status, 404);
  const body = await missing.json();
  assert.equal(body.error.code, "NOT_FOUND");
  assert.equal(body.error.reason, "ROUTE_NOT_FOUND");
  assert.equal(body.error.requestId, missing.headers.get("x-request-id"));
  assert.ok(body.error.requestId);
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
  const malformed = await request("/api/reports", "POST", "{");
  assert.equal(malformed.status, 400);
  const { error } = await malformed.json();
  assert.equal(error.code, "BAD_REQUEST");
  assert.equal(error.reason, "INVALID_JSON");
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
test("API routes require a signed-in user", async () => {
  const anonymous = createApp({ resolveUser: async () => null });
  for (const path of [
    "/api/me",
    "/api/brands",
    "/api/shades",
    "/api/reports",
  ]) {
    const response = await request(path, "GET", undefined, anonymous);
    assert.equal(response.status, 401, path);
    assert.equal((await response.json()).error.code, "UNAUTHORIZED");
  }
});
test("write routes enforce the permission matrix before touching the database", async () => {
  const tsi = createApp({ resolveUser: async () => userWith("tsi") });
  const pid = createApp({ resolveUser: async () => userWith("pid") });
  const id = "818565f8-bc7f-4c65-bd17-331c2e1d3986";
  for (const [target, method, path] of [
    [tsi, "POST", "/api/brands"],
    [tsi, "PATCH", `/api/shades/${id}`],
    [tsi, "POST", "/api/imports/commit"],
    [pid, "PATCH", `/api/reports/${id}`],
    [pid, "PATCH", `/api/prototype-requests/${id}/status`],
    [pid, "PATCH", `/api/prototype-requests/${id}/formulation`],
  ] as const) {
    const response = await request(path, method, {}, target);
    assert.equal(response.status, 403, `${method} ${path}`);
    const { error } = await response.json();
    assert.equal(error.code, "FORBIDDEN");
    assert.equal(error.reason, "MISSING_PERMISSION");
  }
});
test("/api/me returns the signed-in user", async () => {
  const response = await request("/api/me");
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.role, "website_admin");
});
