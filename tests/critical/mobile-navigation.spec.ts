import { test, expect } from '@playwright/test';
import { fastVisit, openMobileDrawer, selectors } from '../helpers/test-utils';

/**
 * Mobile Navigation Tests
 * 
 * Based on shopify-im8-ui:
 * - snippets/header-drawer.liquid
 * 
 * Mobile navigation:
 * - Hamburger: summary.header__icon--menu
 * - Drawer: #menu-drawer
 * - Container: #Details-menu-drawer-container (details element)
 */
test.describe('Mobile Navigation - Critical Interactions', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await fastVisit(page, '/');
  });

  test('page loads on mobile', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('hamburger menu button is visible', async ({ page }) => {
    const hamburger = page.locator(selectors.hamburgerMenu);
    await expect(hamburger).toBeVisible({ timeout: 15000 });
  });

  test('mobile drawer opens on hamburger click', async ({ page }) => {
    await openMobileDrawer(page);
    
    // Drawer should be visible
    await expect(page.locator(selectors.mobileDrawer)).toBeVisible({ timeout: 10000 });
  });

  test('mobile drawer has navigation links', async ({ page }) => {
    await openMobileDrawer(page);
    
    // Check for navigation links
    const navLinks = page.locator(`${selectors.mobileDrawer} a`);
    await navLinks.first().waitFor({ state: 'attached', timeout: 10000 });
    expect(await navLinks.count()).toBeGreaterThan(0);
  });
});
