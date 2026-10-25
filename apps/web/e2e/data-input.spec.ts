import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./helpers/mock-api";

test.describe("Data Input Feature", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto("/data-input");
  });

  // ── READ: tab rendering ────────────────────────────────────────────────────
  test("renders all tabs and switches between modes", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Data Input" }).first(),
    ).toBeVisible();

    await expect(
      page.getByRole("tab", { name: /Manual Entry/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /Paste from Excel/i }),
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: /File Upload/i })).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /Manage Database/i }),
    ).toBeVisible();

    await page.getByRole("tab", { name: /Paste from Excel/i }).click();
    await expect(page.getByLabel(/Spreadsheet data/i)).toBeVisible();

    await page.getByRole("tab", { name: /File Upload/i }).click();
    await expect(page.getByText(/Upload tab-separated data/i)).toBeVisible();

    await page.getByRole("tab", { name: /Manual Entry/i }).click();
  });

  // ── CREATE: add brand ──────────────────────────────────────────────────────
  test("creates a new brand via catalog setup dialog", async ({ page }) => {
    const btn = page.getByRole("button", { name: /\+ Add brand/i });
    await expect(btn).toBeVisible();
    await btn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText(/Add a brand to the product catalog/i),
    ).toBeVisible();

    await dialog
      .getByRole("textbox", { name: /^Name$/i })
      .fill("Sunset Beauty");
    await dialog.getByRole("button", { name: /Create brand/i }).click();

    await expect(page.getByText(/Brand created/i)).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  // ── CREATE: add format ─────────────────────────────────────────────────────
  test("creates a new product format via catalog setup dialog", async ({
    page,
  }) => {
    const btn = page.getByRole("button", { name: /\+ Add format/i });
    await expect(btn).toBeVisible();
    await btn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog
      .getByRole("textbox", { name: /Parent format name/i })
      .fill("Eyes");
    await dialog
      .getByRole("textbox", { name: /Subcategory name/i })
      .fill("Liquid Liner");
    await dialog
      .getByRole("textbox", { name: /Unique format code/i })
      .fill("LL");
    await dialog.getByRole("button", { name: /Create format/i }).click();

    await expect(page.getByText(/Format created/i)).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  // ── CREATE: manual shade entry ─────────────────────────────────────────────
  test("submits a new shade via manual entry form", async ({ page }) => {
    // Select product
    await page.locator("select").first().selectOption({ value: "prod-1" });

    // Fill required name + SKU fields
    await page.locator('input[name="name"]').fill("Dusk Plum");
    await page.locator('input[name="sku"]').fill("DP-01");

    // The HEX input already defaults to #aa6d78; just verify and click submit
    await page.getByRole("button", { name: /\+ Add shade/i }).click();

    await expect(page.getByText(/Shade added to the database/i)).toBeVisible();
  });

  // ── CREATE: paste-import preview → commit ──────────────────────────────────
  test("previews and imports shades via paste tab", async ({ page }) => {
    await page.getByRole("tab", { name: /Paste from Excel/i }).click();

    // Select product
    await page.locator("select").first().selectOption({ value: "prod-1" });

    // Paste TSV (with header row)
    await page
      .getByLabel(/Spreadsheet data/i)
      .fill("SKU\tShade name\tHEX\nDP-02\tDusk Rose\t#c05080");

    // Preview
    await page.getByRole("button", { name: /Preview & validate/i }).click();
    await expect(page.getByText(/1 of 1 rows valid/i)).toBeVisible();

    // Commit import
    await page.getByRole("button", { name: /Import validated rows/i }).click();
    await expect(page.getByText(/1 shades imported/i)).toBeVisible();
  });
});
