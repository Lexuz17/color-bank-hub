import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parseDelimitedText, parseTemplateRows, parseXlsxBuffer } from "../src/features/data-input/utils/template-parser";
import type { Product } from "@color-bank-hub/contracts/catalog";

const templatePath = path.resolve(import.meta.dirname, "../public/templates/shade-import-template.xlsx");

const mockProducts: Product[] = [
  { id: "prod-jelly", brandId: "brand-1", name: "Jelly Stain" },
  { id: "prod-matte", brandId: "brand-2", name: "Colorfit Velvet Matte" },
];

test("parseXlsxBuffer parses the actual shade-import-template.xlsx file", async () => {
  const fileBuffer = fs.readFileSync(templatePath);
  const matrix = await parseXlsxBuffer(fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength));

  assert.equal(matrix.length >= 4, true, "Should have at least 4 rows");

  // Row 1: Header
  const headers = matrix[0];
  assert.equal(headers[0], "Origin");
  assert.equal(headers[1], "Brand");
  assert.equal(headers[2], "Product Name");
  assert.equal(headers[4], "Shade Name");
  assert.equal(headers[5], "SKU");
  assert.equal(headers[6], "HEX Code");

  // Row 3: "08 Ube Mochi"
  const row3 = matrix[2];
  assert.equal(row3[1], "Emina");
  assert.equal(row3[2], "Jelly Stain");
  assert.equal(row3[4], "08 Ube Mochi");
  assert.equal(row3[5], "EM-JS-08");
  assert.equal(row3[6], "#aa6d78");
});

test("parseTemplateRows converts XLSX matrix into valid ShadeInput items", async () => {
  const fileBuffer = fs.readFileSync(templatePath);
  const matrix = await parseXlsxBuffer(fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength));

  const result = parseTemplateRows(matrix, mockProducts, "fallback-prod-id");

  assert.equal(result.parsedCount, 3, "Should parse 3 data rows from template");
  assert.equal(result.rows.length, 3);

  // First data row: "204 Modestia"
  const row1 = result.rows[0];
  assert.equal(row1.name, "204 Modestia");
  assert.equal(row1.hex, "#a5626e");
  assert.equal(row1.productId, "fallback-prod-id");
  assert.equal(row1.ingredientsInci, "Aqua, Glycerin, Propanediol");

  // Second data row: "08 Ube Mochi" (matches Jelly Stain product)
  const row2 = result.rows[1];
  assert.equal(row2.name, "08 Ube Mochi");
  assert.equal(row2.sku, "EM-JS-08");
  assert.equal(row2.hex, "#aa6d78");
  assert.equal(row2.productId, "prod-jelly", "Should link to Jelly Stain product id");
  assert.equal(row2.mayContain, "CI 15850, CI 77491");
  assert.deepEqual(row2.composition, [
    { name: "Red 7 Lake", percentage: 0.202 },
    { name: "Orange 851", percentage: 0.1 },
  ]);

  // Third data row: "01 Nude" (matches Colorfit Velvet Matte product)
  const row3 = result.rows[2];
  assert.equal(row3.name, "01 Nude");
  assert.equal(row3.sku, "WD-CV-01");
  assert.equal(row3.hex, "#c48b7c");
  assert.equal(row3.productId, "prod-matte");
  assert.deepEqual(row3.composition, [{ name: "Brown 1012", percentage: 0.35 }]);
});

test("parseDelimitedText parses TSV clipboard data", () => {
  const tsv = [
    "Origin\tBrand\tProduct Name\tSub-Category Code\tShade Name\tSKU\tHEX Code",
    "Own\tEmina\tJelly Stain\tTG\t08 Ube Mochi\tEM-JS-08\t#aa6d78",
  ].join("\n");

  const matrix = parseDelimitedText(tsv);
  assert.equal(matrix.length, 2);
  assert.equal(matrix[1][4], "08 Ube Mochi");

  const result = parseTemplateRows(matrix, mockProducts);
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].name, "08 Ube Mochi");
  assert.equal(result.rows[0].productId, "prod-jelly");
});

test("parseTemplateRows supports legacy 3-column TSV format", () => {
  const tsv = "EM-01\tBerry Punch\t#cc3366\nEM-02\tPink Blush\tff99aa";
  const matrix = parseDelimitedText(tsv);
  const result = parseTemplateRows(matrix, mockProducts, "prod-default");

  assert.equal(result.rows.length, 2);
  assert.equal(result.rows[0].sku, "EM-01");
  assert.equal(result.rows[0].name, "Berry Punch");
  assert.equal(result.rows[0].hex, "#cc3366");
  assert.equal(result.rows[0].productId, "prod-default");

  // Automatically prefixes '#' to hex without '#'
  assert.equal(result.rows[1].sku, "EM-02");
  assert.equal(result.rows[1].hex, "#ff99aa");
});

test("parseTemplateRows detects unassigned products if neither catalog match nor default ID exists", () => {
  const tsv = "EM-01\tBerry Punch\t#cc3366";
  const matrix = parseDelimitedText(tsv);
  const result = parseTemplateRows(matrix, mockProducts);

  assert.equal(result.unassignedProductsCount, 1);
  assert.equal(result.rows[0].productId, "");
});
