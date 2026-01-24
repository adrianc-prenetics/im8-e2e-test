import { test, expect } from '@playwright/test';
import { fastVisit, killPopups, selectors } from '../helpers/test-utils';

/**
 * Header Navigation Tests
 * 
 * Based on shopify-im8-ui:
 * - sections/header.liquid
 * - snippets/header-mega-menu.liquid
 */
test.describe('Header Navigation - Critical Interactions', () => {
  
  test.beforeEach(async ({ page }) => {
    await fastVisit(page, '/');
  });

  test('header exists with logo', async ({ page }) => {
    // Header element
    await expect(page.locator(selectors.header).first()).toBeVisible({ timeout: 15000 });
    
    // Logo link to homepage
    await expect(page.locator('a[href="/"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('navigation links exist', async ({ page }) => {
    const navLinks = page.locator('nav a');
    expect(await navLinks.count()).toBeGreaterThan(0);
  });

  test('desktop mega menu opens on Shop click', async ({ page }) => {
    // Ensure desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await killPopups(page);
    
    // Find and click Shop link
    const shopLink = page.locator('nav a, .header__menu-item').filter({ hasText: 'Shop' }).first();
    await expect(shopLink).toBeVisible({ timeout: 15000 });
    
    await killPopups(page);
    await shopLink.click({ force: true });
    
    // Verify mega menu content appears
    await expect(page.locator(selectors.megaMenu).first()).toBeVisible({ timeout: 10000 });
  });
});
