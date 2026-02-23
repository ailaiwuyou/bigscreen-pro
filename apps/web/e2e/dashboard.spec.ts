import { test, expect } from "@playwright/test";

test.describe("Dashboard Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");
  });

  test("should create new dashboard", async ({ page }) => {
    await page.click('[data-testid="new-dashboard-btn"]');
    await page.fill('input[name="title"]', "My Test Dashboard");
    await page.fill('input[name="description"]', "Test description");
    await page.click('[data-testid="save-btn"]');
    await expect(page.locator(".dashboard-title")).toContainText(
      "My Test Dashboard",
    );
  });

  test("should edit dashboard", async ({ page }) => {
    await page.click('[data-testid="dashboard-item"]:first-child');
    await page.click('[data-testid="edit-btn"]');
    await page.fill('input[name="title"]', "Updated Dashboard");
    await page.click('[data-testid="save-btn"]');
    await expect(page.locator(".dashboard-title")).toContainText(
      "Updated Dashboard",
    );
  });

  test("should delete dashboard", async ({ page }) => {
    const initialCount = await page.locator(".dashboard-item").count();
    await page.click('[data-testid="dashboard-item"]:first-child');
    await page.click('[data-testid="delete-btn"]');
    await page.click('[data-testid="confirm-delete-btn"]');
    await expect(page.locator(".dashboard-item")).toHaveCount(initialCount - 1);
  });

  test("should publish dashboard", async ({ page }) => {
    await page.click('[data-testid="dashboard-item"]:first-child');
    await page.click('[data-testid="publish-btn"]');
    await expect(page.locator(".publish-status")).toContainText("Published");
  });

  test("should unpublish dashboard", async ({ page }) => {
    await page.click('[data-testid="dashboard-item"]:first-child');
    await page.click('[data-testid="unpublish-btn"]');
    await expect(page.locator(".publish-status")).toContainText("Draft");
  });
});
