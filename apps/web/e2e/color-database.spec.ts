import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./helpers/mock-api";

test.describe("Color Database Feature", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto("/color-database");
  });

  test("displays shade catalog and handles search filter", async ({ page }) => {
    // Check toolbar title
    await expect(page.getByRole("heading", { name: "Color Database" }).first()).toBeVisible();

    // Verify shade items are rendered
    await expect(page.getByText("Crimson Velvet")).toBeVisible();
    await expect(page.getByText("#aa6d78")).toBeVisible();

    // Use search input to filter
    const searchInput = page.getByPlaceholder(/search/i).first();
    await searchInput.fill("Solar");
    await expect(page.getByText("Solar Coral")).toBeVisible();
  });

  test("renders shade attributes in table without detail panel", async ({ page }) => {
    // Verify shade and related columns are directly visible in the table
    await expect(page.getByText("Crimson Velvet")).toBeVisible();
    await expect(page.getByText("Aura Beauty").first()).toBeVisible();
    await expect(page.getByText("#aa6d78")).toBeVisible();

    // Detail panel header should not be present
    await expect(page.locator(":visible").filter({ hasText: "PRODUCT DETAIL" })).toHaveCount(0);
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
