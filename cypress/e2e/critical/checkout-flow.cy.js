/**
 * Checkout Flow Tests
 * 
 * Tests the complete checkout flow from cart drawer:
 * - Add item to cart (cart drawer auto-opens)
 * - Click checkout button
 * - Verify navigation to checkout page
 * 
 * Reference: /Users/adrianchan/shopify-im8-ui/snippets/cart-drawer.liquid
 * Reference: /Users/adrianchan/shopify-im8-ui/assets/cart-drawer.js
 * 
 * The checkout button:
 * - id="CartDrawer-Checkout"
 * - type="submit" with name="checkout"
 * - form="CartDrawer-Form" (action="/cart")
 * - Shopify redirects to checkout when form submitted with name="checkout"
 * 
 * Cart drawer auto-opens after ATC via renderContents() -> open()
 */
describe('Checkout Flow - Critical Interactions', () => {
  const checkoutButtonSelector = '#CartDrawer-Checkout';
  
  it('can navigate to checkout from cart drawer', () => {
    cy.log('[TEST] Starting: can navigate to checkout from cart drawer');
    
    // Step 1: Add item to cart - drawer auto-opens
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    
    // Step 2: Wait for cart drawer to auto-open and be fully active
    // The drawer opens via renderContents() which calls open()
    cy.get('cart-drawer.active', { timeout: 15000 })
      .should('exist');
    
    // Step 3: Wait for drawer content to render (checkout button appears)
    cy.get(checkoutButtonSelector, { timeout: 10000 })
      .should('exist');
    
    // Step 4: Wait for any animations/transitions to complete
    // and for the button to be fully interactive
    cy.wait(1000);
    
    // Step 5: Verify checkout button is visible and enabled
    cy.get(checkoutButtonSelector)
      .should('be.visible')
      .should('not.be.disabled');
    
    // Step 6: Click checkout button
    cy.get(checkoutButtonSelector)
      .click();
    
    // Step 7: Verify navigation to checkout
    // Shopify checkout URLs can be:
    // - https://im8health.com/checkouts/...
    // - https://checkout.shopify.com/...
    cy.url({ timeout: 30000 })
      .should('include', 'checkout');
    
    cy.log('[TEST] Successfully navigated to checkout');
  });
});
