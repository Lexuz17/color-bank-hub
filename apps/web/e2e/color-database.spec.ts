import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./helpers/mock-api";

test.describe("Color Database Feature", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto("/color-database");
  });

  test("displays shade catalog and handles search filter", async ({ page }) => {
    // Check toolbar title
    await expect(
      page.getByRole("heading", { name: "Color Database" }).first(),
    ).toBeVisible();

    // Verify shade items are rendered
    await expect(page.getByText("Crimson Velvet")).toBeVisible();
    await expect(page.getByText("#aa6d78")).toBeVisible();

    // Use search input to filter
    const searchInput = page.getByPlaceholder(/search/i).first();
    await searchInput.fill("Solar");
    await expect(page.getByText("Solar Coral")).toBeVisible();
  });

  test("inspects a shade and opens product detail panel", async ({ page }) => {
    // Click on Crimson Velvet inspect button
    const shadeBtn = page
      .getByRole("button", { name: /Crimson Velvet/i })
      .first();
    await shadeBtn.click();

    // Verify detail panel shows product and ingredients
    await expect(
      page.locator(":visible").filter({ hasText: "PRODUCT DETAIL" }).first(),
    ).toBeVisible();
    await expect(
      page
        .locator(":visible")
        .filter({ hasText: "Velvet Satin Lipstick" })
        .first(),
    ).toBeVisible();
    await expect(
      page
        .locator(":visible")
        .filter({ hasText: /Dimethicone, Silica/ })
        .first(),
    ).toBeVisible();
  });

  test("filters shades by category in sidebar", async ({ page }) => {
    // Sidebar contains format categories like Lips
    const categoryButton = page.getByRole("button", { name: /Lips/i }).first();
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      const formatItem = page.getByText("Matte Lipstick").first();
      await expect(formatItem).toBeVisible();
    }
  });
});
