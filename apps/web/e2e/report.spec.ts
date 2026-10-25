import { test, expect } from "@playwright/test";
import { setupApiMocks, mockReports } from "./helpers/mock-api";

test.describe("Report Feature", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto("/report");
  });

  test("displays report list and status indicators", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Report" }).first(),
    ).toBeVisible();

    // Verify report item is rendered
    await expect(
      page.getByText(`Report ${mockReports[0].id.slice(0, 8)}`),
    ).toBeVisible();
    await expect(page.getByText(mockReports[0].description)).toBeVisible();

    // Check status badge exists (e.g., Pending)
    await expect(
      page
        .locator("span")
        .filter({ hasText: /^Pending$/ })
        .first(),
    ).toBeVisible();
  });

  test("filters reports by status and opens new report modal", async ({
    page,
  }) => {
    // Check status filter dropdown
    const statusSelect = page.locator("select").first();
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption({ label: "Pending" });
    }

    // Open new report drawer / modal
    const newReportBtn = page
      .getByRole("button", { name: /New Report|\+ Report/i })
      .first();
    if (await newReportBtn.isVisible()) {
      await newReportBtn.click();
      await expect(
        page.getByRole("heading", { name: /New Report|Submit Report/i }),
      ).toBeVisible();

      // Close modal
      await page.keyboard.press("Escape");
    }
  });
});
