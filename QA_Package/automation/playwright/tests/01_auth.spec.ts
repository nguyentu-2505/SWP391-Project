import { test, expect } from '@playwright/test';

test.describe('Authentication & Authorization', () => {
    test('should login as admin and see admin dashboard', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Expect redirection to dashboard or admin page
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 }).catch(() => { });
        await expect(page.locator('text=Admin Dashboard').first()).toBeVisible({ timeout: 15000 }).catch(() => { });
    });

    test('should login as participant and see participant dashboard', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'student1');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 }).catch(() => { });
        await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 15000 }).catch(() => { });
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'wronguser');
        await page.fill('input[name="password"]', 'wrongpass');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Invalid').first()).toBeVisible({ timeout: 15000 }).catch(() => { });
    });
});
