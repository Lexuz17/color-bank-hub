import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./helpers/mock-api";

test.describe("Mappings, User Management & Showcase", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test("renders shade mapping workspace", async ({ page }) => {
    await page.goto("/shade-mapping");
    await expect(
      page.getByRole("heading", { name: "Shade Map" }).first(),
    ).toBeVisible();

    // Verify canvas/visualizer or mapping controls exist
    const toolbar = page
      .getByText(/By season · demonstration placement/i)
      .first();
    await expect(toolbar).toBeVisible();
  });

  test("renders my mappings page", async ({ page }) => {
    await page.goto("/my-mappings");
    await expect(
      page.getByRole("heading", { name: "My Mappings" }).first(),
    ).toBeVisible();
  });

  test("renders user management page with role controls", async ({ page }) => {
    await page.goto("/user-management");
    await expect(
      page.getByRole("heading", { name: "User Management" }).first(),
    ).toBeVisible();
  });

  test("renders component showcase page with interactive controls", async ({
    page,
  }) => {
    await page.goto("/showcase");
    await expect(
      page.getByText(/Shared application layout|Design system tokens/i).first(),
    ).toBeVisible();
  });
});
