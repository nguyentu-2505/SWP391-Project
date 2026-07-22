import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('User can log in with valid credentials', async ({ page }) => {
    // Navigate to Login (Mapped from frontend/src/pages/Login.tsx)
    await page.goto('http://localhost:5173/login');
    
    // Fill credentials
    await page.fill('input[name="email"]', 'user@fpt.edu.vn');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Expect dashboard navigation
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('Shows error on invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="email"]', 'invalid@fpt.edu.vn');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');
    
    // Toast or validation message
    await expect(page.locator('.toast-error')).toBeVisible();
  });
});
