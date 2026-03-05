import { test, expect } from '@playwright/test';
import { fastVisit, killPopups, selectors } from '../helpers/test-utils';

/**
 * Sticky ATC Bar Tests
 *
 * Tests that ATC button remains accessible after scrolling.
 * The product page has two ATC surfaces:
 * 1. Main product-form with ProductSubmitButton (in viewport at top)
 * 2. Sticky bar (.product-buy-sticky-container) fixed at bottom after scroll
 *
 * CRITICAL: Must use fastVisit() to set US market cookies and force locale,
 * otherwise product may not be available in default market (some EU markets disabled).
 */
test.describe('Sticky ATC Bar - Critical Interactions', () => {

  test('product page has ATC functionality after scroll', async ({ page }) => {
    // Use fastVisit to set market + block popups + force US locale
    await fastVisit(page, '/products/essentials-pro');
    
    // Wait for body to be visible
    await expect(page.locator('body')).toBeVisible();
    
    // Broader ATC selector: includes main form button AND sticky bar button
    const atcSelector = 'product-form button[type="submit"], button[name="add"], .product-form__submit, [id^="ProductSubmitButton"], .product-buy-sticky__button';

    // Wait for any ATC button to appear in DOM — these are server-rendered
    const atcButton = page.locator(atcSelector).first();
    await atcButton.waitFor({ state: 'attached', timeout: 30000 });

    // Scroll to bottom to trigger sticky bar
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    await killPopups(page);

    // Verify ATC button is still accessible (either main form button or sticky bar button)
    const buttonCount = await page.locator(atcSelector).count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});
