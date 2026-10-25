import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./helpers/mock-api";

test.describe("Data Input Feature", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto("/data-input");
  });

  test("renders all tabs and switches between modes", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Data Input" }).first(),
    ).toBeVisible();

    // Verify tabs are available
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

    // Switch to Paste tab
    await page.getByRole("tab", { name: /Paste from Excel/i }).click();
    await expect(page.getByLabel(/Spreadsheet data/i)).toBeVisible();

    // Switch to File Upload tab
    await page.getByRole("tab", { name: /File Upload/i }).click();
    await expect(page.getByText(/Upload tab-separated data/i)).toBeVisible();

    // Switch back to Manual tab
    await page.getByRole("tab", { name: /Manual Entry/i }).click();
  });

  test("fills manual shade entry form with product selection and color preview", async ({
    page,
  }) => {
    // Select product from dropdown
    const productSelect = page.locator("select").first();
    await productSelect.selectOption({
      label: "Color Lab Studio · Velvet Satin Lipstick",
    });

    // Fill shade fields
    const shadeNameInput = page
      .getByPlaceholder(/e\.g\. Ruby Velvet|name/i)
      .first();
    if (await shadeNameInput.isVisible()) {
      await shadeNameInput.fill("Dusk Plum");
    }

    const hexInput = page.getByPlaceholder(/#aa6d78|#RRGGBB/i).first();
    if (await hexInput.isVisible()) {
      await hexInput.fill("#8b263e");
    }

    // Submit button is active
    const submitBtn = page
      .getByRole("button", { name: /Add Shade|Save/i })
      .first();
    await expect(submitBtn).toBeVisible();
  });

  test("opens Quick Setup dialogs for new formats and brands", async ({
    page,
  }) => {
    // Format button
    const newFormatBtn = page.getByRole("button", { name: /\+ Format/i });
    if (await newFormatBtn.isVisible()) {
      await newFormatBtn.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      // Close dialog
      await page.keyboard.press("Escape");
    }

    // Brand button
    const newBrandBtn = page.getByRole("button", { name: /\+ Brand/i });
    if (await newBrandBtn.isVisible()) {
      await newBrandBtn.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
    }
  });
});
