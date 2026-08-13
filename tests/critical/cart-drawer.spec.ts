import { test, expect } from '@playwright/test';
import { fastVisit, addProductToCartByHandle, addToCartOrSkip, expectCartDrawerOpen, openCartDrawer, killPopups, selectors } from '../helpers/test-utils';

/**
 * Cart Drawer Tests
 *
 * Based on shopify-im8-ui:
 * - snippets/cart-drawer.liquid
 * - assets/cart-drawer.js
 *
 * Two homepage visits, not four: icon/open is one journey, add+checkout is another.
 */
test.describe('Cart Drawer - Critical Interactions', () => {

  test('cart icon opens the cart drawer', async ({ page }) => {
    await fastVisit(page, '/');

    const cartIcon = page.locator(selectors.cartIcon);
    await expect(cartIcon).toBeVisible({ timeout: 10000 });

    await openCartDrawer(page);
    await expectCartDrawerOpen(page);
  });

  test('adding an item shows an enabled checkout button', async ({ page }) => {
    await fastVisit(page, '/');

    await addToCartOrSkip(() => addProductToCartByHandle(page, 'essentials-pro'));
    await killPopups(page);
    await expectCartDrawerOpen(page);

    const checkoutButton = page.locator(selectors.checkoutButton).first();
    await expect(checkoutButton).toBeAttached({ timeout: 8000 });
    await expect(checkoutButton).toBeEnabled({ timeout: 8000 });
  });
});
