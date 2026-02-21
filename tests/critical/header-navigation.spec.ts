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

  test('desktop mega menu has product links', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await killPopups(page);
    
    // The header mega menu now shows product links directly (no "Shop" parent link)
    const megaMenuLinks = page.locator('.mega-menu__link, [id^="MegaMenu-Content"] a');
    await megaMenuLinks.first().waitFor({ state: 'attached', timeout: 15000 });
    
    expect(await megaMenuLinks.count()).toBeGreaterThan(0);
  });
});
