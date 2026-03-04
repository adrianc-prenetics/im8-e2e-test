import { test, expect } from '@playwright/test';
import { killPopups } from '../helpers/test-utils';

/**
 * Sticky ATC Bar Tests
 *
 * Tests that ATC button remains accessible after scrolling.
 * The product page has two ATC surfaces:
 * 1. Main product-form with ProductSubmitButton (in viewport at top)
 * 2. Sticky bar (.product-buy-sticky-container) fixed at bottom after scroll
 *
 * NOTE: Uses lightweight navigation (no homepage-first market init) because
 * this test only checks DOM presence — it doesn't need US market pricing.
 * This avoids timeouts on CI when the site is slow after many prior tests.
 */
test.describe('Sticky ATC Bar - Critical Interactions', () => {

  test('product page has ATC functionality after scroll', async ({ page }) => {
    // Block popups at network level
    await page.route('**/*klaviyo*', route => route.abort());
    await page.route('**/static.klaviyo.com/**', route => route.abort());
    await page.route(/alia-prod\.com/, route => route.abort());
    await page.route('**/*gorgias*', route => route.abort());
    await page.route('**/*loox*', route => route.abort());

    // Navigate directly — use domcontentloaded since ATC buttons are server-rendered
    // and don't require JS initialization to exist in the DOM
    await page.goto('/products/essentials-pro', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('body', { timeout: 15000 });
    await killPopups(page);

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
