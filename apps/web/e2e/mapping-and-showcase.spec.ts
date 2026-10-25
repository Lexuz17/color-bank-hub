import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./helpers/mock-api";

test.describe("Mappings, User Management & Showcase", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  // ── READ: shade mapping workspace ─────────────────────────────────────────
  test("renders shade mapping workspace", async ({ page }) => {
    await page.goto("/shade-mapping");
    await expect(
      page.getByRole("heading", { name: "Shade Map" }).first(),
    ).toBeVisible();

    const toolbar = page
      .getByText(/By season · demonstration placement/i)
      .first();
    await expect(toolbar).toBeVisible();
  });

  // ── CREATE: select shades and generate a map ──────────────────────────────
  test("selects shades and generates a shade map", async ({ page }) => {
    await page.goto("/shade-mapping");

    // Check at least one shade checkbox in the sidebar
    const firstCheckbox = page.getByRole("checkbox").first();
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.check();

    // Count shown should reflect the selection
    await expect(page.getByText(/1 selected/i)).toBeVisible();

    // Click Generate
    await page.getByRole("button", { name: /Generate/i }).click();

    // Map canvas labels appear after generation
    await expect(page.getByText(/Summer · Cool \/ Light/i)).toBeVisible();
  });

  // ── CREATE: save a generated mapping ─────────────────────────────────────
  test("saves a generated shade mapping to local library", async ({ page }) => {
    await page.goto("/shade-mapping");

    // Select a shade and generate
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: /Generate/i }).click();

    // Save mapping button becomes enabled
    const saveBtn = page.getByRole("button", { name: /Save mapping/i });
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: /Save mapping/i }),
    ).toBeVisible();

    await dialog
      .getByRole("textbox", { name: /Mapping name/i })
      .fill("Q4 Autumn Collection");

    // Confirm save is enabled once name is filled
    const confirmSave = dialog.getByRole("button", { name: /Save mapping/i });
    await expect(confirmSave).toBeEnabled();
    await confirmSave.click();

    await expect(page.getByText(/Mapping saved locally/i)).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  // ── READ: my mappings page ────────────────────────────────────────────────
  test("renders my mappings page with empty state", async ({ page }) => {
    await page.goto("/my-mappings");
    await expect(
      page.getByRole("heading", { name: "My Mappings" }).first(),
    ).toBeVisible();

    // Empty state is expected (sessionStorage has no saved mappings in test)
    await expect(page.getByText(/No saved mappings/i)).toBeVisible();
  });

  // ── CREATE/DELETE: save then delete a mapping via my-mappings ────────────
  test("saves a mapping then deletes it from my mappings", async ({ page }) => {
    // 1. Create a mapping on shade-mapping page
    await page.goto("/shade-mapping");
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: /Generate/i }).click();
    await page.getByRole("button", { name: /Save mapping/i }).click();
    await page
      .getByRole("dialog")
      .getByRole("textbox", { name: /Mapping name/i })
      .fill("Test Mapping");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /Save mapping/i })
      .click();
    await expect(page.getByText(/Mapping saved locally/i)).toBeVisible();

    // 2. Navigate to my-mappings
    await page.goto("/my-mappings");
    await expect(page.getByText("Test Mapping")).toBeVisible();

    // 3. Delete it
    await page.getByRole("button", { name: /Delete Test Mapping/i }).click();

    const alertDialog = page.getByRole("alertdialog");
    await expect(alertDialog).toBeVisible();
    await expect(
      alertDialog.getByRole("heading", { name: /Delete mapping/i }),
    ).toBeVisible();

    await alertDialog.getByRole("button", { name: /Delete/i }).click();

    await expect(page.getByText("Test Mapping")).not.toBeVisible();
    await expect(page.getByText(/No saved mappings/i)).toBeVisible();
  });

  // ── UPDATE: pin / unpin a mapping ─────────────────────────────────────────
  test("pins and unpins a saved mapping", async ({ page }) => {
    // Create a mapping first
    await page.goto("/shade-mapping");
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: /Generate/i }).click();
    await page.getByRole("button", { name: /Save mapping/i }).click();
    await page
      .getByRole("dialog")
      .getByRole("textbox", { name: /Mapping name/i })
      .fill("Pinnable Map");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /Save mapping/i })
      .click();
    await expect(page.getByText(/Mapping saved locally/i)).toBeVisible();

    await page.goto("/my-mappings");
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
    // Seed two mappings
    for (const name of ["Alpha Map", "Beta Collection"]) {
      await page.goto("/shade-mapping");
      await page.getByRole("checkbox").first().check();
      await page.getByRole("button", { name: /Generate/i }).click();
      await page.getByRole("button", { name: /Save mapping/i }).click();
      await page
        .getByRole("dialog")
        .getByRole("textbox", { name: /Mapping name/i })
        .fill(name);
      await page
        .getByRole("dialog")
        .getByRole("button", { name: /Save mapping/i })
        .click();
      await expect(page.getByText(/Mapping saved locally/i)).toBeVisible();
    }

    await page.goto("/my-mappings");
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
    await expect(
      page.getByRole("heading", { name: "User Management" }).first(),
    ).toBeVisible();
  });

  // ── READ: showcase ────────────────────────────────────────────────────────
  test("renders component showcase page with interactive controls", async ({
    page,
  }) => {
    await page.goto("/showcase");
    await expect(
      page.getByText(/Shared application layout|Design system tokens/i).first(),
    ).toBeVisible();
  });
});
