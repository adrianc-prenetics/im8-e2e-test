import { test, expect } from '@playwright/test';
import { fastVisit, addToCart, expectCartDrawerOpen, selectors } from '../helpers/test-utils';

/**
 * Add to Cart Tests
 *
 * Based on shopify-im8-ui:
 * - snippets/buy-buttons.liquid (ATC button)
 * - assets/product-form.js (ATC behavior)
 *
 * One PDP visit covers load + ATC + drawer. Splitting that into two tests
 * doubled Shopify traffic for the same journey.
 */
test.describe('Add to Cart - Critical Interactions', () => {

  test('product page ATC opens the cart drawer', async ({ page }) => {
    await fastVisit(page, '/products/essentials-pro');

    await expect(page).toHaveURL(/\/products\//);
    const atcButton = page.locator(selectors.atcButton).first();
    await expect(atcButton).toBeVisible({ timeout: 15000 });

    await addToCart(page);
    await expectCartDrawerOpen(page);
  });
});
