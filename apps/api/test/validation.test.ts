import { test } from "node:test";
import assert from "node:assert/strict";
import { colorMetrics } from "../src/services/color-service.js";
import { composition } from "@color-bank-hub/contracts/common";
import { can } from "@color-bank-hub/contracts/rbac";
import { transitionInput } from "@color-bank-hub/contracts/prototype";
import { reportInput } from "@color-bank-hub/contracts/report";
import {
  shadeInput,
  shadePatch,
  shadeQuery,
} from "@color-bank-hub/contracts/shade";
const shade = {
  productId: "818565f8-bc7f-4c65-bd17-331c2e1d3986",
  sku: "TEST-001",
  name: "Rose",
  hex: "#AA6D78",
};
test("HEX input is normalized and unknown fields are rejected", () => {
  assert.equal(shadeInput.parse(shade).hex, "#aa6d78");
  assert.equal(
    shadeInput.safeParse({ ...shade, createdBy: shade.productId }).success,
    false,
  );
  for (const hex of ["red", "#abc", "#gg0000", ""]) {
    assert.equal(shadeInput.safeParse({ ...shade, hex }).success, false);
  }
});
test("pagination, patch, composition, and report inputs reject invalid values", () => {
  for (const query of [
    { page: 0 },
    { pageSize: 101 },
    { sort: "password" },
    { season: "invalid" },
  ])
    assert.equal(shadeQuery.safeParse(query).success, false);
  assert.equal(shadePatch.safeParse({}).success, false);
  assert.equal(
    composition.safeParse([
      { name: "A", percentage: 90 },
      { name: "B", percentage: 20 },
    ]).success,
    false,
  );
  assert.equal(reportInput.safeParse({ description: "short" }).success, false);
});
test("declining a request requires a reason", () => {
  assert.equal(
    transitionInput.safeParse({ status: "declined" }).success,
    false,
  );
  assert.equal(
    transitionInput.safeParse({
      status: "declined",
      declineReason: "Outside brief",
    }).success,
    true,
  );
});
test("sRGB color conversions match primary colors and D65 neutral references", () => {
  const red = colorMetrics("#ff0000");
  assert.equal(red.r, 255);
  assert.equal(red.hslH, 0);
  assert.equal(red.hslS, 100);
  assert.equal(red.hslL, 50);
  assert.equal(red.hsbS, 100);
  assert.equal(red.hsbB, 100);
  assert.ok(Math.abs(red.labL - 53.24) < 0.02);
  assert.ok(Math.abs(red.labA - 80.09) < 0.02);
  assert.ok(Math.abs(red.labB - 67.2) < 0.02);
  const white = colorMetrics("#ffffff");
  assert.equal(white.labL, 100);
  assert.ok(Math.abs(white.labA) < 0.02);
  assert.ok(Math.abs(white.labB) < 0.02);
  const black = colorMetrics("#000000");
  assert.equal(black.labL, 0);
  assert.equal(black.hslS, 0);
  assert.equal(colorMetrics("#00ff00").hslH, 120);
  assert.equal(colorMetrics("#0000ff").hslH, 240);
});
test("permission matrix grants each capability only to its roles", () => {
  assert.equal(can("website_admin", "user:manage"), true);
  assert.equal(can("rnd", "user:manage"), false);
  assert.equal(can("rnd", "catalog:write"), true);
  assert.equal(can("tsi", "catalog:write"), false);
  assert.equal(can("tsi", "shade:viewComposition"), true);
  assert.equal(can("pid", "shade:viewComposition"), false);
  assert.equal(can("pid", "prototype:create"), true);
  assert.equal(can(null, "report:create"), false);
});
