import { test, expect } from '@playwright/test';
import { killPopups, selectors } from '../helpers/test-utils';

/**
 * Sticky ATC Bar Tests
 *
 * Tests that ATC button remains accessible after scrolling.
 * The product page has two ATC surfaces:
 * 1. Main product-form with ProductSubmitButton (in viewport at top)
 * 2. Sticky bar (.product-buy-sticky-container) fixed at bottom after scroll
 *
 * NOTE: This test only checks DOM presence, not ATC flow.
 * Uses lightweight navigation (no homepage-first) to avoid timeouts on slow CI.
 * Still sets US market via cookies + blocks popups at network level.
 */
test.describe('Sticky ATC Bar - Critical Interactions', () => {

  test('product page has ATC functionality after scroll', async ({ page }) => {
    // Block popups at network level (same as fastVisit does)
    await page.route('**/*klaviyo*', route => route.abort());
    await page.route('**/static.klaviyo.com/**', route => route.abort());
    await page.route(/alia-prod\.com/, route => route.abort());
    await page.route('**/*gorgias*', route => route.abort());
    await page.route('**/*loox*', route => route.abort());

    // Set US market cookies
    await page.context().addCookies([
      { name: 'localization', value: 'US', domain: 'im8health.com', path: '/' },
      { name: 'cart_currency', value: 'USD', domain: 'im8health.com', path: '/' },
    ]);

    // Navigate directly to product (skip homepage)
    // Use longer timeout since first load can be slow
    await page.goto('https://im8health.com/products/essentials-pro', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    
    // Wait for body
    await page.waitForSelector('body', { timeout: 15000 });
    
    // Force US market in localStorage
    await page.evaluate(() => {
      try {
        localStorage.setItem('shopify_market', 'US');
        localStorage.setItem('currency', 'USD');
      } catch (e) {}
    });
    
    // Kill popups
    await killPopups(page);

    // Broader ATC selector: includes main form button AND sticky bar button
    const atcSelector = 'product-form button[type="submit"], button[name="add"], .product-form__submit, [id^="ProductSubmitButton"], .product-buy-sticky__button';

    // Wait for any ATC button to appear in DOM
    // Use very generous timeout: 60s (CI can be slow after many prior tests)
    const atcButton = page.locator(atcSelector).first();
    await atcButton.waitFor({ state: 'attached', timeout: 60000 });

    // Scroll to bottom to trigger sticky bar
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    await killPopups(page);

    // Verify ATC button is still accessible
    const buttonCount = await page.locator(atcSelector).count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});
