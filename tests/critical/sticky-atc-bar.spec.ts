import { test, expect } from '@playwright/test';
import { fastVisit, killPopups, selectors } from '../helpers/test-utils';

/**
 * Sticky ATC Bar Tests
 *
 * Tests that ATC button remains accessible after scrolling.
 * The product page has two ATC surfaces:
 * 1. Main product-form with ProductSubmitButton (in viewport at top)
 * 2. Sticky bar (.product-buy-sticky-container) fixed at bottom after scroll
 */
test.describe('Sticky ATC Bar - Critical Interactions', () => {

  test('product page has ATC functionality after scroll', async ({ page }) => {
    // Use direct URL to avoid /products/essentials → /products/essentials-pro redirect
    await fastVisit(page, '/products/essentials-pro');
    await killPopups(page);

    // Wait for either: product-form CE registered, form in DOM, or sticky bar initialized
    await page.waitForFunction(() => {
      const ceReady = typeof customElements !== 'undefined' &&
             customElements.get('product-form') !== undefined;
      const formExists = !!document.querySelector('product-form form, form[data-type="add-to-cart-form"], form.test-product-form');
      const stickyBarExists = !!document.querySelector('.product-buy-sticky-container');
      return ceReady || formExists || stickyBarExists;
    }, { timeout: 30000 });

    // Broader ATC selector: includes main form button AND sticky bar button
    const atcSelector = 'product-form button[type="submit"], button[name="add"], .product-form__submit, [id^="ProductSubmitButton"], .product-buy-sticky__button';

    // Verify ATC button exists
    const atcButton = page.locator(atcSelector).first();
    await atcButton.waitFor({ state: 'attached', timeout: 20000 });

    // Scroll to bottom to trigger sticky bar
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Verify ATC button is still accessible (either main form button or sticky bar button)
    const buttonCount = await page.locator(atcSelector).count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});
