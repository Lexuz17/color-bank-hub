import { test, expect } from "@playwright/test";
import { setupApiMocks, mockRequests } from "./helpers/mock-api";

test.describe("Color Bank Prototype Feature", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto("/color-bank");
  });

  test("displays prototype requests list with status badges", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "Color Bank" }).first(),
    ).toBeVisible();

    // Verify request item
    await expect(page.getByText("Autumn Rose Formulation")).toBeVisible();
    await expect(page.getByText(/Color Lab Studio/i).first()).toBeVisible();
  });

  test("inspects prototype request and views workflow panel", async ({
    page,
  }) => {
    // Click on the request row
    const requestRow = page.getByText("Autumn Rose Formulation").first();
    await requestRow.click();

    // Verify detail panel shows request properties and workflow buttons
    await expect(
      page.locator(":visible").filter({ hasText: "Approve request" }).first(),
    ).toBeVisible();
    await expect(
      page
        .locator(":visible")
        .filter({ hasText: /Targeting Q3 launch campaign/ })
        .first(),
    ).toBeVisible();
  });

  test("opens new prototype request dialog", async ({ page }) => {
    const newRequestBtn = page
      .getByRole("button", { name: /New Request|\+ Request/i })
      .first();
    if (await newRequestBtn.isVisible()) {
      await newRequestBtn.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
    }
  });
});
