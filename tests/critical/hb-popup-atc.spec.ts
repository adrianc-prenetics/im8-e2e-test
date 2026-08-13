import { test, expect } from '@playwright/test';
import { fastVisit, openHbPopup, addToCartFromHbPopup, addToCartOrSkip, expectCartDrawerOpen, selectors } from '../helpers/test-utils';

/**
 * HB Popup Add to Cart Tests
 *
 * Based on shopify-im8-ui:
 * - snippets/hb-popup.liquid
 * - templates/product.hb-popup-ajax.liquid
 * - assets/global.js (lines 1780-1840)
 * - assets/product-form.js (lines 144-154)
 *
 * Two collection visits, not five. Popup inspect stays separate from add so a
 * bot-skip on ATC does not hide a popup-open failure.
 */
test.describe('HB Popup Add to Cart - Critical Interactions', () => {

  test('collection quick-add opens HB popup with options and ATC', async ({ page }) => {
    await fastVisit(page, '/collections/all');

    const quickAddButtons = page.locator(selectors.quickAddButton);
    await quickAddButtons.first().waitFor({ state: 'attached', timeout: 10000 });
    expect(await quickAddButtons.count()).toBeGreaterThan(0);

    await openHbPopup(page);
    await expect(page.locator(selectors.hbPopupActive)).toBeVisible({ timeout: 8000 });

    const variantOptions = page.locator('[js-hb-popup] input[type="radio"]');
    await variantOptions.first().waitFor({ state: 'attached', timeout: 8000 });
    expect(await variantOptions.count()).toBeGreaterThan(0);

    await expect(page.locator(selectors.hbPopupAtcButton)).toBeVisible({ timeout: 8000 });
  });

  test('can add product to cart from HB popup', async ({ page }) => {
    await fastVisit(page, '/collections/all');
    await openHbPopup(page);
    await addToCartOrSkip(() => addToCartFromHbPopup(page));
    await expectCartDrawerOpen(page);
  });
});
