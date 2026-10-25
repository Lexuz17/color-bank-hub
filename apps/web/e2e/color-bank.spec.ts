import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./helpers/mock-api";

test.describe("Color Bank Prototype Feature", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto("/color-bank");
  });

  // ── READ: list ─────────────────────────────────────────────────────────────
  test("displays prototype requests list with status badges", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "Color Bank" }).first(),
    ).toBeVisible();

    await expect(page.getByText("Autumn Rose Formulation")).toBeVisible();
    await expect(page.getByText(/Color Lab Studio/i).first()).toBeVisible();
  });

  // ── READ: detail panel ────────────────────────────────────────────────────
  test("inspects prototype request and views workflow panel", async ({
    page,
  }) => {
    const requestRow = page.getByText("Autumn Rose Formulation").first();
    await requestRow.click();

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

  // ── READ: status filter ───────────────────────────────────────────────────
  test("filters requests by status", async ({ page }) => {
    const statusSelect = page.getByLabel(/Filter request status/i);
    await expect(statusSelect).toBeVisible();
    await statusSelect.selectOption({ label: "Pending" });
    await expect(page.getByText("Autumn Rose Formulation")).toBeVisible();
  });

  // ── CREATE: new prototype request ─────────────────────────────────────────
  test("submits a new prototype request via dialog", async ({ page }) => {
    const newRequestBtn = page.getByRole("button", { name: /\+ New request/i });
    await expect(newRequestBtn).toBeVisible();
    await newRequestBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: /New prototype request/i }),
    ).toBeVisible();

    // Fill required text fields
    await dialog
      .getByRole("textbox", { name: /Target brand/i })
      .fill("Indie Lab");
    await dialog
      .getByRole("textbox", { name: /Target product/i })
      .fill("Velvet Tint");
    await dialog
      .getByRole("textbox", { name: /Target shade/i })
      .fill("Berry Bliss");

    // HEX already has a default — leave as-is
    await dialog.getByRole("button", { name: /Submit request/i }).click();

    await expect(page.getByText(/Prototype request submitted/i)).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  // ── UPDATE: approve a request ─────────────────────────────────────────────
  test("approves a pending prototype request", async ({ page }) => {
    // Click the request row to load its detail panel
    await page.getByText("Autumn Rose Formulation").first().click();

    // Click the Approve request button in the detail panel
    const approveBtn = page.getByRole("button", { name: /Approve request/i });
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // Confirm dialog appears
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: /Approve request/i }),
    ).toBeVisible();

    await dialog.getByRole("button", { name: /Confirm/i }).click();

    await expect(page.getByText(/Request updated/i)).toBeVisible();
  });

  // ── UPDATE: decline a request ─────────────────────────────────────────────
  test("declines a pending prototype request with a reason", async ({
    page,
  }) => {
    await page.getByText("Autumn Rose Formulation").first().click();

    const declineBtn = page
      .locator(":visible")
      .filter({ hasText: /^Decline$/ })
      .first();
    await declineBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: /Decline request/i }),
    ).toBeVisible();

    // Reason is required — confirm stays disabled until filled
    const confirmBtn = dialog.getByRole("button", { name: /Confirm/i });
    await expect(confirmBtn).toBeDisabled();

    await dialog
      .getByRole("textbox")
      .fill("Does not meet minimum delta-E spec.");
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    await expect(page.getByText(/Request updated/i)).toBeVisible();
  });
});
