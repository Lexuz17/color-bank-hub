import { test, expect } from "@playwright/test";
import { setupApiMocks, mockReports } from "./helpers/mock-api";

test.describe("Report Feature", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto("/report");
  });

  // ── READ: list ─────────────────────────────────────────────────────────────
  test("displays report list and status indicators", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Report" }).first(),
    ).toBeVisible();

    await expect(
      page.getByText(`Report ${mockReports[0].id.slice(0, 8)}`),
    ).toBeVisible();
    await expect(page.getByText(mockReports[0].description)).toBeVisible();

    await expect(
      page
        .locator("span")
        .filter({ hasText: /^Pending$/ })
        .first(),
    ).toBeVisible();
  });

  // ── READ: status filter ────────────────────────────────────────────────────
  test("filters reports by status", async ({ page }) => {
    const statusSelect = page.getByLabel(/Filter report status/i);
    await expect(statusSelect).toBeVisible();
    await statusSelect.selectOption({ label: "Pending" });
    // List stays visible after filtering
    await expect(
      page.getByText(`Report ${mockReports[0].id.slice(0, 8)}`),
    ).toBeVisible();
  });

  // ── CREATE: submit report form ─────────────────────────────────────────────
  test("submits a new report", async ({ page }) => {
    // The submit form is always visible on this page (left column)
    await expect(
      page.getByRole("heading", { name: /Submit a report/i }),
    ).toBeVisible();

    // Fill description (required, minLength 10)
    await page
      .getByRole("textbox", { name: /Issue description/i })
      .fill("Shade 08 has a visible yellow shift vs the master swatch.");

    await page.getByRole("button", { name: /Submit report/i }).click();

    await expect(page.getByText(/Report submitted/i)).toBeVisible();
  });

  // ── UPDATE: mark a report resolved ────────────────────────────────────────
  test("marks a pending report as resolved", async ({ page }) => {
    const markBtn = page
      .getByRole("button", { name: /Mark resolved/i })
      .first();
    await expect(markBtn).toBeVisible();
    await markBtn.click();

    await expect(page.getByText(/Report status updated/i)).toBeVisible();
  });
});
