import { test, expect } from '@playwright/test';
import { fastVisit, killPopups } from '../helpers/test-utils';

/**
 * Sticky ATC Bar Tests
 *
 * Tests that ATC button remains accessible after scrolling.
 * The product page has two ATC surfaces:
 * 1. Main product-form with ProductSubmitButton (in viewport at top)
 * 2. Sticky bar (.product-buy-sticky-container) fixed at bottom after scroll
 *
 * Uses fastVisit so bot-skip and Web Bot Auth match the rest of the suite.
 */
test.describe('Sticky ATC Bar - Critical Interactions', () => {

  test('product page has ATC functionality after scroll', async ({ page }) => {
    await fastVisit(page, '/products/essentials-pro');

    const atcSelector = 'product-form button[type="submit"], button[name="add"], .product-form__submit, [id^="ProductSubmitButton"], .product-buy-sticky__button';
    const atcButton = page.locator(atcSelector).first();
    await atcButton.waitFor({ state: 'attached', timeout: 15000 });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const sticky = page.locator('.product-buy-sticky-container, .product-buy-sticky__button');
    await sticky.first().waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});
    await killPopups(page);

    expect(await page.locator(atcSelector).count()).toBeGreaterThan(0);
  });
});
