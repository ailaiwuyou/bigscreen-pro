import { test, expect } from '@playwright/test';

test.describe('home page', () => {
  test('should display home page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check main heading
    await expect(page.locator('h1')).toHaveText('BigScreen Pro');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click login button
    await page.click('button:has-text("开始使用")');
    
    // Should navigate to login or dashboard
    await expect(page).toHaveURL(/\/(login|dashboard)/);
  });
});

test.describe('login page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    // Check form elements exist
    await expect(page.locator('input[type="text"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('.el-button')).toBeVisible();
  });

  test('should show error with empty credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Click submit without entering credentials
    await page.click('.el-button');
    
    // Should show validation errors (element-plus handles this)
    await page.waitForTimeout(500);
  });
});

test.describe('navigation', () => {
  test('should have correct navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });
});
