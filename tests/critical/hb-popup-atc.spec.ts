import { test, expect } from '@playwright/test';
import { fastVisit, openHbPopup, addToCartFromHbPopup, expectCartDrawerOpen, killPopups, selectors } from '../helpers/test-utils';

/**
 * HB Popup Add to Cart Tests
 *
 * Based on shopify-im8-ui:
 * - snippets/hb-popup.liquid
 * - templates/product.hb-popup-ajax.liquid
 * - assets/global.js (lines 1780-1840)
 * - assets/product-form.js (lines 144-154)
 *
 * Flow:
 * 1. Click [quick-add__submit] on collection page
 * 2. Popup fetched via AJAX and shown with 'active' class
 * 3. Click #ProductSubmitButton-hb-popup-ajax
 * 4. cart.renderContents() called → cart drawer opens
 * 5. Popup closes (removes 'active', adds 'hidden')
 *
 * NOTE: openHbPopup has built-in retry logic — if the first product's popup
 * fails to open, it tries the next candidate product automatically.
 * 
 * TIMEOUT: 50s per test (covers collection load + popup AJAX + hydration + ATC)
 */
test.describe('HB Popup Add to Cart - Critical Interactions', () => {

  test.beforeEach(async ({ page }) => {
    await fastVisit(page, '/collections/all');
  });

  test('collection page has quick-add buttons', async ({ page }) => {
    test.setTimeout(50000);
    const quickAddButtons = page.locator(selectors.quickAddButton);
    await quickAddButtons.first().waitFor({ state: 'attached', timeout: 20000 });
    expect(await quickAddButtons.count()).toBeGreaterThan(0);
  });

  test('clicking quick-add button opens HB popup', async ({ page }) => {
    test.setTimeout(50000);
    await openHbPopup(page);

    // Popup should have 'active' class
    await expect(page.locator(selectors.hbPopupActive)).toBeVisible({ timeout: 15000 });
  });

  test('HB popup displays product options', async ({ page }) => {
    test.setTimeout(50000);
    await openHbPopup(page);

    // Variant options in popup (product.hb-popup-ajax.liquid)
    const variantOptions = page.locator('[js-hb-popup] input[type="radio"]');
    await variantOptions.first().waitFor({ state: 'attached', timeout: 15000 });
    expect(await variantOptions.count()).toBeGreaterThan(0);
  });

  test('HB popup has ATC button', async ({ page }) => {
    test.setTimeout(50000);
    await openHbPopup(page);

    // ATC button: #ProductSubmitButton-hb-popup-ajax
    const popupAtcButton = page.locator(selectors.hbPopupAtcButton);
    await expect(popupAtcButton).toBeVisible({ timeout: 15000 });
  });

  test('can add product to cart from HB popup', async ({ page }) => {
    test.setTimeout(50000);
    await openHbPopup(page);

    // Add to cart from popup - this opens cart drawer
    await addToCartFromHbPopup(page);

    // Cart drawer should be active
    await expectCartDrawerOpen(page);
  });
});
