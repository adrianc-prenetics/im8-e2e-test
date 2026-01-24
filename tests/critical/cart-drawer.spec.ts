import { test, expect } from '@playwright/test';
import { fastVisit, addToCart, openCartDrawer, waitForCartDrawerReady, waitForCartDrawerOpen, killPopups, selectors } from '../helpers/test-utils';

/**
 * Cart Drawer Tests
 * 
 * Based on shopify-im8-ui:
 * - snippets/cart-drawer.liquid
 * - assets/cart-drawer.js
 * 
 * Cart drawer open sequence (from cart-drawer.js):
 * 1. open() adds 'opening' class
 * 2. requestAnimationFrame adds 'animate' + 'active' classes
 * 3. After 50ms, 'opening' is removed
 * 
 * BULLETPROOF: We check for 'animate' OR 'active' since both indicate drawer is open
 */
test.describe('Cart Drawer - Critical Interactions', () => {
  
  test('cart icon is visible on homepage', async ({ page }) => {
    await fastVisit(page, '/');
    
    // Cart icon: #cart-icon-bubble (header.liquid line 307)
    const cartIcon = page.locator(selectors.cartIcon);
    await expect(cartIcon).toBeVisible({ timeout: 15000 });
  });

  test('clicking cart icon opens cart drawer', async ({ page }) => {
    await fastVisit(page, '/');
    
    // Open cart drawer via cart icon (cart-drawer.js line 46-49)
    await openCartDrawer(page);
    
    // BULLETPROOF: Drawer should be open (any state)
    await waitForCartDrawerOpen(page);
    
    // Verify drawer element is visible
    await expect(page.locator(selectors.cartDrawer)).toBeVisible({ timeout: 10000 });
  });

  test('cart drawer shows checkout button when items in cart', async ({ page }) => {
    await fastVisit(page, '/products/essentials');
    
    // Add to cart - drawer opens automatically
    await addToCart(page);
    
    // BULLETPROOF: Wait for drawer to be fully ready
    await waitForCartDrawerReady(page);
    
    // Kill any popups before checking button
    await killPopups(page);
    
    // Checkout button: use multiple selectors for resilience
    const checkoutButton = page.locator(selectors.checkoutButtonAny).first();
    await expect(checkoutButton).toBeVisible({ timeout: 10000 });
  });

  test('can add item to cart from product page', async ({ page }) => {
    await fastVisit(page, '/products/essentials');
    
    // Add to cart and verify drawer opens
    await addToCart(page);
    
    // BULLETPROOF: Wait for drawer to be open (any state)
    await waitForCartDrawerOpen(page);
    
    // Verify drawer element is visible
    await expect(page.locator(selectors.cartDrawer)).toBeVisible({ timeout: 10000 });
  });
});
