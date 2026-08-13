import { test, expect } from '@playwright/test';
import { fastVisit, openMobileDrawer, selectors } from '../helpers/test-utils';

/**
 * Mobile Navigation Tests
 *
 * Based on shopify-im8-ui:
 * - snippets/header-drawer.liquid
 *
 * One homepage visit covers load, hamburger, drawer, and links.
 */
test.describe('Mobile Navigation - Critical Interactions', () => {

  test.use({ viewport: { width: 375, height: 812 } });

  test('hamburger opens a drawer with navigation links', async ({ page }) => {
    await fastVisit(page, '/');

    const hamburger = page.locator(selectors.hamburgerMenu);
    await expect(hamburger).toBeVisible({ timeout: 10000 });

    await openMobileDrawer(page);
    await expect(page.locator(selectors.mobileDrawer)).toBeVisible({ timeout: 8000 });

    const navLinks = page.locator(`${selectors.mobileDrawer} a`);
    await navLinks.first().waitFor({ state: 'attached', timeout: 8000 });
    expect(await navLinks.count()).toBeGreaterThan(0);
  });
});
