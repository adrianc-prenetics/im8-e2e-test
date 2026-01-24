import { test, expect } from '@playwright/test';
import { fastVisit, addToCart, waitForCartDrawerReady, killPopups, selectors } from '../helpers/test-utils';

/**
 * Checkout Flow Tests
 * 
 * Based on shopify-im8-ui:
 * - snippets/cart-drawer.liquid (checkout button)
 * - assets/cart-drawer.js (drawer behavior)
 * 
 * Checkout button:
 * - ID: #CartDrawer-Checkout (line 1745)
 * - type="submit" name="checkout" form="CartDrawer-Form"
 * - Submitting with name="checkout" redirects to Shopify checkout
 */
test.describe('Checkout Flow - Critical Interactions', () => {
  
  test('can navigate to checkout from cart drawer', async ({ page }) => {
    // Step 1: Visit product page and add to cart
    await fastVisit(page, '/products/essentials');
    await addToCart(page);
    
    // Step 2: Verify cart drawer is fully ready
    await waitForCartDrawerReady(page);
    
    // Step 3: Kill popups before interacting
    await killPopups(page);
    
    // Step 4: Verify checkout button is visible and enabled
    const checkoutButton = page.locator(selectors.checkoutButton);
    await expect(checkoutButton).toBeVisible({ timeout: 10000 });
    await expect(checkoutButton).toBeEnabled();
    
    // Step 5: Click checkout button
    await killPopups(page);
    await checkoutButton.click({ force: true });
    
    // Step 6: Verify navigation to checkout or cart page
    // Shopify may redirect to /cart first, then checkout
    await page.waitForURL(/checkout|\/cart/, { timeout: 30000 });
    
    const url = page.url();
    if (url.includes('/cart') && !url.includes('checkout')) {
      // If on cart page, verify checkout button exists there
      await expect(page.locator('button[name="checkout"], input[name="checkout"]').first())
        .toBeVisible({ timeout: 10000 });
    }
  });
});
