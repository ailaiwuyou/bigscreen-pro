import { test, expect } from "@playwright/test";

test.describe("Editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/editor/test-dashboard-id");
  });

  test("should load editor interface", async ({ page }) => {
    await expect(page.locator(".editor-canvas")).toBeVisible();
    await expect(page.locator(".component-panel")).toBeVisible();
    await expect(page.locator(".property-panel")).toBeVisible();
  });

  test("should display component panel with components", async ({ page }) => {
    await expect(page.locator(".component-panel")).toBeVisible();
    await expect(page.locator(".component-item")).not.toHaveCount(0);
  });

  test("should display property panel", async ({ page }) => {
    await expect(page.locator(".property-panel")).toBeVisible();
  });

  test("should add component to canvas", async ({ page }) => {
    await page.dragAndDrop(".component-item:first-child", ".editor-canvas");
    await expect(page.locator(".canvas-component")).toBeVisible();
  });

  test("should select component and show properties", async ({ page }) => {
    await page.click(".canvas-component");
    await expect(
      page.locator(".property-panel .component-props"),
    ).toBeVisible();
  });

  test("should save editor changes", async ({ page }) => {
    await page.click('[data-testid="save-btn"]');
    await expect(page.locator(".toast-success")).toBeVisible();
  });

  test("should preview dashboard", async ({ page }) => {
    await page.click('[data-testid="preview-btn"]');
    await expect(page).toHaveURL(/\/preview\//);
  });
});
