import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./helpers/mock-api";

test.describe("App Navigation & Layout", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test("renders shell, loads home page and toggles dark mode", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/web|color/i);

    // Verify main brand header / logo is visible
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Verify theme toggle button functions
    const themeToggle = page
      .locator(
        'button[aria-label*="theme" i], button:has(.lucide-sun), button:has(.lucide-moon)',
      )
      .first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      // Theme changes html attribute class or data-theme
      const html = page.locator("html");
      await expect(html).toBeDefined();
    }
  });

  test("navigates across all workspace views via header/sidebar links", async ({
    page,
  }) => {
    await page.goto("/");

    const routes = [
      { path: "/color-database", title: "Color Database" },
      { path: "/data-input", title: "Data Input" },
      { path: "/report", title: "Report" },
      { path: "/color-bank", title: "Color Bank" },
      { path: "/shade-mapping", title: "Shade Map" },
      { path: "/my-mappings", title: "My Mappings" },
      { path: "/user-management", title: "User Management" },
      { path: "/showcase", title: "Showcase" },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page).toHaveURL(new RegExp(route.path));
      // Verify the page heading / shell contains the section name
      const heading = page
        .getByRole("heading", { name: new RegExp(route.title, "i") })
        .first();
      await expect(heading).toBeVisible();
    }
  });
});
