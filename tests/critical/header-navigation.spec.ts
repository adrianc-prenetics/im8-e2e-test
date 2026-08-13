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

  test('header, nav, and mega menu product links are present', async ({ page }) => {
    await fastVisit(page, '/');

    const header = page.locator(selectors.header).filter({ visible: true }).first();
    await expect(header).toBeVisible({ timeout: 10000 });

    await expect(
      page.locator('header.header a.header__heading-link[href="/"]')
    ).toBeVisible({ timeout: 8000 });

    const navLinks = page.locator('nav a');
    expect(await navLinks.count()).toBeGreaterThan(0);

    await page.setViewportSize({ width: 1280, height: 720 });
    await killPopups(page);

    const megaMenuLinks = page.locator('.mega-menu__link, [id^="MegaMenu-Content"] a');
    await megaMenuLinks.first().waitFor({ state: 'attached', timeout: 10000 });
    expect(await megaMenuLinks.count()).toBeGreaterThan(0);
  });
});
