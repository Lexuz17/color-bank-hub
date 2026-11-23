import { expect, test } from "@playwright/test";
import { setupApiMocks } from "./helpers/mock-api";

test.describe("Data Input Feature", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto("/data-input");
  });

  test("shows the input methods and the template download", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "File Upload" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Download template \(\.xlsx\)/i })).toHaveAttribute("href", "/templates/shade-import-template.xlsx");

    await page.getByRole("button", { name: "Manual Entry" }).click();
    await expect(page.getByRole("heading", { name: "Manual Entry" })).toBeVisible();
    await expect(page.getByRole("button", { name: "+ Add shade" })).toBeVisible();

    await page.getByRole("button", { name: "Manage Database" }).click();
    await expect(page.getByRole("heading", { name: "Manage Database" })).toBeVisible();
  });
});
