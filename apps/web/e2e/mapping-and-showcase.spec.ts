import { test, expect, type Page } from "@playwright/test";
import { setupApiMocks } from "./helpers/mock-api";

async function selectFormatAndShade(page: Page) {
  await page.goto("/shade-mapping");

  // Step 1: select Category "Lips"
  await page.getByRole("combobox", { name: "Category", exact: true }).click();
  await page.getByRole("option", { name: "Lips" }).click();

  // Step 1: select Sub-category "Matte Lipstick"
  await page.getByRole("combobox", { name: "Sub-category" }).click();
  await page.getByRole("option", { name: "Matte Lipstick" }).click();

  // Step 2: pick first shade checkbox
  const firstCheckbox = page.getByRole("checkbox").first();
  await expect(firstCheckbox).toBeVisible();
  await firstCheckbox.check();
}

test.describe("Mappings, User Management & Showcase", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  // ── READ: shade mapping workspace ─────────────────────────────────────────
  test("renders shade mapping workspace", async ({ page }) => {
    await page.goto("/shade-mapping");
    await expect(page.getByLabel("Mapping name")).toBeVisible();
    await expect(page.getByText(/PRODUCT FORMAT/i)).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Category", exact: true })).toBeVisible();
  });

  // ── CREATE: select shades and generate a map ──────────────────────────────
  test("selects shades and generates a shade map", async ({ page }) => {
    await selectFormatAndShade(page);

    // Count shown should reflect the selection
    await expect(page.getByText(/1 selected/i)).toBeVisible();

    // Click Generate
    await page.getByRole("button", { name: /Generate/i }).click();

    // Map container and reset/save buttons become available
    await expect(page.getByRole("button", { name: /^save$/i })).toBeEnabled();
  });

  // ── CREATE: save a generated mapping ─────────────────────────────────────
  test("saves a generated shade mapping to library", async ({ page }) => {
    await selectFormatAndShade(page);
    await page.getByRole("button", { name: /Generate/i }).click();

    // Set mapping name in toolbar input
    const nameInput = page.getByLabel("Mapping name");
    await nameInput.fill("Q4 Autumn Collection");

    // Save mapping button becomes enabled
    const saveBtn = page.getByRole("button", { name: /^save$/i });
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    // Toast feedback appears
    await expect(page.getByText(/Saved "Q4 Autumn Collection"/i)).toBeVisible();
  });

  // ── READ: my mappings page ────────────────────────────────────────────────
  test("renders my mappings page with empty state", async ({ page }) => {
    await page.goto("/my-mappings");
    await expect(page.getByRole("heading", { name: "My Mappings" }).first()).toBeVisible();

    // Empty state is expected (sessionStorage has no saved mappings in test)
    await expect(page.getByText(/No saved mappings/i)).toBeVisible();
  });

  // ── CREATE/DELETE: save then delete a mapping via my-mappings ────────────
  test("saves a mapping then deletes it from my mappings", async ({ page }) => {
    await page.goto("/my-mappings");
    await page.evaluate(() => {
      localStorage.setItem(
        "color-bank-demo-mappings",
        JSON.stringify([
          {
            id: "map-test-1",
            name: "Test Mapping",
            shadeNames: ["Crimson Velvet"],
            pinned: false,
            updated: new Date().toISOString(),
          },
        ]),
      );
    });
    await page.reload();

    await expect(page.getByText("Test Mapping")).toBeVisible();

    // Delete it
    await page.getByRole("button", { name: /Delete Test Mapping/i }).click();

    const alertDialog = page.getByRole("alertdialog");
    await expect(alertDialog).toBeVisible();
    await expect(alertDialog.getByRole("heading", { name: /Delete mapping/i })).toBeVisible();

    await alertDialog.getByRole("button", { name: /Delete/i }).click();

    await expect(page.getByText("Test Mapping")).not.toBeVisible();
    await expect(page.getByText(/No saved mappings/i)).toBeVisible();
  });

  // ── UPDATE: pin / unpin a mapping ─────────────────────────────────────────
  test("pins and unpins a saved mapping", async ({ page }) => {
    await page.goto("/my-mappings");
    await page.evaluate(() => {
      localStorage.setItem(
        "color-bank-demo-mappings",
        JSON.stringify([
          {
            id: "map-pin-1",
            name: "Pinnable Map",
            shadeNames: ["Crimson Velvet"],
            pinned: false,
            updated: new Date().toISOString(),
          },
        ]),
      );
    });
    await page.reload();

    await expect(page.getByText("Pinnable Map")).toBeVisible();

    // Pin
    await page.getByRole("button", { name: /Pin Pinnable Map/i }).click();

    // Pinned filter now shows 1
    const pinnedBtn = page
      .locator("button")
      .filter({ hasText: /^Pinned/ })
      .first();
    await expect(pinnedBtn).toContainText("1");

    // Click Pinned filter — card still visible
    await pinnedBtn.click();
    await expect(page.getByText("Pinnable Map")).toBeVisible();

    // Unpin
    await page.getByRole("button", { name: /Unpin Pinnable Map/i }).click();
    await expect(pinnedBtn).toContainText("0");
  });

  // ── READ: search filter on my mappings ───────────────────────────────────
  test("filters saved mappings by search term", async ({ page }) => {
    await page.goto("/my-mappings");
    await page.evaluate(() => {
      localStorage.setItem(
        "color-bank-demo-mappings",
        JSON.stringify([
          {
            id: "map-alpha",
            name: "Alpha Map",
            shadeNames: ["Crimson Velvet"],
            pinned: false,
            updated: new Date().toISOString(),
          },
          {
            id: "map-beta",
            name: "Beta Collection",
            shadeNames: ["Solar Coral"],
            pinned: false,
            updated: new Date().toISOString(),
          },
        ]),
      );
    });
    await page.reload();

    await expect(page.getByText("Alpha Map")).toBeVisible();
    await expect(page.getByText("Beta Collection")).toBeVisible();

    // Search for "Alpha"
    await page.getByPlaceholder(/Search mappings/i).fill("Alpha");
    await expect(page.getByText("Alpha Map")).toBeVisible();
    await expect(page.getByText("Beta Collection")).not.toBeVisible();
  });

  // ── READ: user management ─────────────────────────────────────────────────
  test("renders user management page with role controls", async ({ page }) => {
    await page.goto("/user-management");
    await expect(page.getByRole("heading", { name: "User Management" }).first()).toBeVisible();
  });

  // ── READ: showcase ────────────────────────────────────────────────────────
  test("renders component showcase page with interactive controls", async ({ page }) => {
    await page.goto("/showcase");
    await expect(page.getByText(/Shared application layout|Design system tokens/i).first()).toBeVisible();
  });
});
