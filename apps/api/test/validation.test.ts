import { test } from "node:test";
import assert from "node:assert/strict";
import { colorMetrics } from "../src/services/color-service.js";
import {
  shadeInput,
  shadePatch,
  shadeQuery,
  composition,
} from "../src/models/catalog.js";
import { transitionInput, reportInput } from "../src/models/workflows.js";
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
