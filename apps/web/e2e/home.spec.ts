import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load home page successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/BigScreen/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should display navigation menu", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("nav >> text=Home")).toBeVisible();
    await expect(page.locator("nav >> text=Projects")).toBeVisible();
  });

  test("should navigate to editor", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="new-project-btn"]');
    await expect(page).toHaveURL(/\/editor/);
  });

  test("should display project list", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".project-list")).toBeVisible();
  });
});
