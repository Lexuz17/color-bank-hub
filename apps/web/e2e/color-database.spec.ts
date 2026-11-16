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
    await expect(page.getByRole("cell", { name: "Color Lab Studio" }).first()).toBeVisible();
    await expect(page.getByText("#aa6d78")).toBeVisible();

    // Detail panel header should not be present
    await expect(page.locator(":visible").filter({ hasText: "PRODUCT DETAIL" })).toHaveCount(0);
  });

  test("filters shades by category segment in sidebar and shows breadcrumb title", async ({ page }) => {
    // Both Lips and Face shades are initially visible
    await expect(page.getByText("Crimson Velvet")).toBeVisible();
    await expect(page.getByText("Golden Honey")).toBeVisible();

    // Click Lips category segment (excluding the chevron expand button)
    const lipsButton = page.getByRole("button", { name: /^Lips \d+/i }).first();
    await lipsButton.click();

    // Breadcrumb title updates to 'Lips › All Lips'
    await expect(page.getByRole("heading", { name: /Lips › All Lips/i })).toBeVisible();

    // Lips shades are visible, Face shades are filtered out
    await expect(page.getByText("Crimson Velvet")).toBeVisible();
    await expect(page.getByText("Golden Honey")).not.toBeVisible();
  });

  test("selects shades with checkboxes and navigates via Map selected", async ({ page }) => {
    // Check first shade checkbox (Crimson Velvet)
    const rowCheckbox = page.getByRole("checkbox", { name: /Select Crimson Velvet/i });
    await expect(rowCheckbox).toBeVisible();
    await rowCheckbox.check();

    // Sidebar footer card appears with count and format name
    await expect(page.getByText(/1 shade selected from/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear" })).toBeVisible();
    const mapBtn = page.getByRole("button", { name: "Map selected" });
    await expect(mapBtn).toBeVisible();

    // Click Map selected
    await mapBtn.click();
    await expect(page).toHaveURL(/\/shade-mapping/);
  });
});
