import { test, expect } from '@playwright/test';
import { fastVisit, openHbPopup, addToCartFromHbPopup, killPopups, selectors } from '../helpers/test-utils';

/**
 * HB Popup Add to Cart Tests
 * 
 * Based on shopify-im8-ui:
 * - snippets/hb-popup.liquid
 * - templates/product.hb-popup-ajax.liquid
 * - assets/global.js (lines 1749-1795)
 * - assets/product-form.js (lines 144-154)
 * 
 * Flow:
 * 1. Click [quick-add__submit] on collection page
 * 2. Popup fetched and shown with 'active' class
 * 3. Click #ProductSubmitButton-hb-popup-ajax
 * 4. cart.renderContents() called → cart drawer opens
 * 5. Popup closes (removes 'active', adds 'hidden')
 */
test.describe('HB Popup Add to Cart - Critical Interactions', () => {
  
  test.beforeEach(async ({ page }) => {
    await fastVisit(page, '/collections/all');
  });

  test('collection page has quick-add buttons', async ({ page }) => {
    // Quick-add buttons: [quick-add__submit] (global.js line 1751)
    const quickAddButtons = page.locator(selectors.quickAddButton);
    await quickAddButtons.first().waitFor({ state: 'attached', timeout: 20000 });
    expect(await quickAddButtons.count()).toBeGreaterThan(0);
  });

  test('clicking quick-add button opens HB popup', async ({ page }) => {
    await openHbPopup(page);
    
    // Popup should have 'active' class (global.js line 1770)
    await expect(page.locator(selectors.hbPopupActive)).toBeVisible({ timeout: 10000 });
  });

  test('HB popup displays product options', async ({ page }) => {
    await openHbPopup(page);
    
    // Variant options in popup (product.hb-popup-ajax.liquid)
    const variantOptions = page.locator('[js-hb-popup] input[type="radio"]');
    await variantOptions.first().waitFor({ state: 'attached', timeout: 10000 });
    expect(await variantOptions.count()).toBeGreaterThan(0);
  });

  test('HB popup has ATC button', async ({ page }) => {
    await openHbPopup(page);
    
    // ATC button: #ProductSubmitButton-hb-popup-ajax
    const popupAtcButton = page.locator(selectors.hbPopupAtcButton);
    await expect(popupAtcButton).toBeVisible({ timeout: 10000 });
  });

  test('can add product to cart from HB popup', async ({ page }) => {
    await openHbPopup(page);
    
    // Add to cart from popup - this opens cart drawer
    await addToCartFromHbPopup(page);
    
    // Cart drawer should be active (product-form.js line 145 → cart-drawer.js open())
    await expect(page.locator(selectors.cartDrawerActive)).toBeVisible({ timeout: 10000 });
  });
});
