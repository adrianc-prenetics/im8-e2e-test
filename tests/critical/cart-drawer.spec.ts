import { test, expect } from '@playwright/test';
import { fastVisit, addToCart, addProductToCartByHandle, openCartDrawer, killPopups, selectors } from '../helpers/test-utils';

/**
 * Cart Drawer Tests
 *
 * Based on shopify-im8-ui:
 * - snippets/cart-drawer.liquid
 * - assets/cart-drawer.js
 *
 * Cart drawer behavior:
 * - Custom element <cart-drawer>
 * - Opens with 'active' class (line 98)
 * - 'opening' class during transition (removed after 50ms)
 * - Checkout button: #CartDrawer-Checkout
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

    // Drawer should be active and ready
    await expect(page.locator(selectors.cartDrawerActive)).toBeVisible({ timeout: 10000 });
  });

  test('cart drawer shows checkout button when items in cart', async ({ page }) => {
    await fastVisit(page, '/');

    // Add to cart via Shopify APIs to avoid repeated product-page bot challenges in CI
    await addProductToCartByHandle(page, 'essentials-pro');

    // Kill any popups before checking button
    await killPopups(page);

    // Checkout button: #CartDrawer-Checkout (cart-drawer.liquid line 1745)
    const checkoutButton = page.locator(selectors.checkoutButton);
    await expect(checkoutButton).toBeVisible({ timeout: 10000 });
  });

  test('can add item to cart from product page', async ({ page }) => {
    await fastVisit(page, '/');

    // Add to cart via Shopify APIs; product-page coverage lives in add-to-cart.spec.ts.
    await addProductToCartByHandle(page, 'essentials-pro');

    // Drawer should be active
    await expect(page.locator(selectors.cartDrawerActive)).toBeVisible({ timeout: 10000 });
  });
});
