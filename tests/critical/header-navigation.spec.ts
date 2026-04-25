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

    // Logo link — match the unconditional .header__heading-link class on the
    // anchor itself. Earlier draft used `h1.header__heading > a` but the <h1>
    // wrapper only renders on homepage (header.liquid wraps it in
    // {% if request.page_type == 'index' %}). Anchor class survives every
    // page type, so this stays correct if the test is later reused on PDP/cart.
    await expect(
      page.locator('header.header a.header__heading-link[href="/"]')
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
