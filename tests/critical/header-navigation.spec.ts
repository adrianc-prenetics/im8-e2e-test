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
    // Header element — scope to the visible header (mobile shows one, desktop another)
    const header = page.locator(selectors.header).filter({ visible: true }).first();
    await expect(header).toBeVisible({ timeout: 15000 });

    // Logo link — semantic match on the actual header heading anchor.
    // Avoids the off-screen shop-now-bar logo (y=-773 w=0 h=0) which has
    // identical href="/" + aria-label but isn't the real navigation logo.
    await expect(
      page.locator('header.header h1.header__heading > a[href="/"]')
    ).toBeVisible({ timeout: 10000 });
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
