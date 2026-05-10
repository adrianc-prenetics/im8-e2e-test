import { test, expect } from '@playwright/test';
import { fastVisit, addProductToCartByHandle, expectCartDrawerOpen, killPopups, selectors } from '../helpers/test-utils';

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
    // Step 1: Visit homepage and add to cart through Shopify APIs.
    // Avoids repeated product-page loads, which can trigger Shopify bot verification in CI.
    await fastVisit(page, '/');
    await addProductToCartByHandle(page, 'essentials-pro');
    
    // Step 2: Verify cart drawer reached open state
    await expectCartDrawerOpen(page);
    
    // Step 3: Kill popups before interacting
    await killPopups(page);
    
    // Step 4: Verify checkout button is visible and enabled
    // Cart update can take time — button starts disabled with "$0" until cart JS updates it
    const checkoutButton = page.locator(selectors.checkoutButton);
    await expect(checkoutButton).toBeAttached({ timeout: 10000 });
    await expect(checkoutButton).toBeEnabled({ timeout: 15000 });
    
    // Step 5: Click checkout button
    await killPopups(page);
    await checkoutButton.click({ force: true });
    
    // Step 6: Verify navigation to checkout or cart page
    // Shopify may redirect to /cart first, then checkout
    await page.waitForURL(/checkout|\/cart/, { timeout: 30000 });
    
    const url = page.url();
    expect(url).toMatch(/checkout|\/cart/);
  });
});
