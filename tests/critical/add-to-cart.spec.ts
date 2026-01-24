import { test, expect } from '@playwright/test';
import { fastVisit, addToCart, selectors } from '../helpers/test-utils';

/**
 * Add to Cart Tests
 * 
 * Based on shopify-im8-ui:
 * - snippets/buy-buttons.liquid (ATC button)
 * - assets/product-form.js (ATC behavior)
 * 
 * ATC flow (product-form.js):
 * 1. Click button → 'loading' class added
 * 2. AJAX POST to /cart/add.js
 * 3. Success → cart.renderContents() → drawer opens with 'active' class
 * 4. 'loading' class removed
 */
test.describe('Add to Cart - Critical Interactions', () => {
  
  test.beforeEach(async ({ page }) => {
    await fastVisit(page, '/products/essentials');
  });

  test('product page loads with ATC button', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/products\//);
    
    // ATC button: [id^="ProductSubmitButton"] (buy-buttons.liquid)
    const atcButton = page.locator(selectors.atcButton).first();
    await expect(atcButton).toBeVisible({ timeout: 20000 });
  });

  test('can click ATC button and cart drawer opens', async ({ page }) => {
    // Add to cart - waits for drawer to be fully ready
    await addToCart(page);
    
    // Verify cart drawer is active
    await expect(page.locator(selectors.cartDrawerActive)).toBeVisible({ timeout: 10000 });
  });
});
