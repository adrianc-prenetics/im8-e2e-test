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
 * 
 * Cart drawer open sequence (from cart-drawer.js):
 * 1. renderContents() is called after ATC
 * 2. setTimeout(() => open()) is called
 * 3. open() adds 'opening' class
 * 4. requestAnimationFrame adds 'animate' + 'active' classes
 * 5. After 50ms, 'opening' is removed
 * 
 * BULLETPROOF: We check for 'animate' OR 'active' since both indicate drawer is open
 */
test.describe('Checkout Flow - Critical Interactions', () => {
  
  test('can navigate to checkout from cart drawer', async ({ page }) => {
    // Step 1: Visit product page and add to cart
    await fastVisit(page, '/products/essentials');
    await addToCart(page);
    
    // Step 2: BULLETPROOF wait for cart drawer to be fully ready
    await waitForCartDrawerReady(page);
    
    // Step 3: Kill popups before interacting
    await killPopups(page);
    
    // Step 4: Wait for checkout button content to render
    // Use multiple selectors for resilience
    const checkoutButton = page.locator(selectors.checkoutButtonAny).first();
    await expect(checkoutButton).toBeVisible({ timeout: 15000 });
    await expect(checkoutButton).toBeEnabled();
    
    // Step 5: Extra wait for form-button relationship to be established
    // (ensureFormReady() in cart-drawer.js re-establishes form attribute)
    await page.waitForTimeout(500);
    
    // Step 6: Click checkout button
    await killPopups(page);
    await checkoutButton.scrollIntoViewIfNeeded();
    await checkoutButton.click({ force: true });
    
    // Step 7: Wait for navigation to begin
    await page.waitForTimeout(2000);
    
    // Step 8: Verify navigation to checkout or cart page
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
