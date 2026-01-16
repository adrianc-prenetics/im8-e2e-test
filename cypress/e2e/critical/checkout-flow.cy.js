/**
 * Checkout Flow Tests
 * 
 * Tests the checkout flow from cart drawer:
 * - Add item to cart
 * - Cart drawer opens automatically
 * - Click checkout button
 * - Verify navigation to checkout page
 * 
 * Reference: /Users/adrianchan/shopify-im8-ui/snippets/cart-drawer.liquid
 * Reference: /Users/adrianchan/shopify-im8-ui/sections/header.liquid (line 307)
 * 
 * Cart icon: #cart-icon-bubble
 * Checkout button: #CartDrawer-Checkout with name="checkout"
 * 
 * NOTE: Cart drawer opens automatically after adding to cart
 */
describe('Checkout Flow - Critical Interactions', () => {
  // Selectors from theme files
  const cartIconSelector = '#cart-icon-bubble';
  const checkoutButtonSelector = '#CartDrawer-Checkout, button[name="checkout"].cart__checkout-button';
  
  it('product page has checkout path', () => {
    cy.log('[TEST] Starting: product page has checkout path');
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(2000);
    cy.log('[TEST] Checkout flow test completed');
  });

  it('can navigate to checkout from cart drawer', () => {
    cy.log('[TEST] Starting: can navigate to checkout from cart drawer');
    
    // Add item to cart
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    
    // Wait for cart drawer to fully render (it re-renders after ATC)
    cy.wait(3000);
    
    // Wait for checkout button to be stable and click it
    // Use {force: true} to handle any re-renders during click
    cy.get(checkoutButtonSelector, { timeout: 10000 })
      .should('be.visible')
      .should('be.enabled')
      .click({ force: true });
    
    // Verify we're on checkout page or being redirected
    // Note: Checkout may redirect to Shopify checkout domain
    cy.url({ timeout: 15000 }).should('include', 'checkout');
    
    cy.log('[TEST] Successfully navigated to checkout');
  });

  it('checkout button is visible in cart drawer after adding item', () => {
    cy.log('[TEST] Starting: checkout button is visible in cart drawer');
    
    // Add item to cart first
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    
    // Wait for cart drawer to fully render
    cy.wait(3000);
    
    // Checkout button MUST be visible - this catches hidden button bugs
    cy.get(checkoutButtonSelector, { timeout: 10000 })
      .should('be.visible');
    
    cy.log('[TEST] Checkout button is visible');
  });
});
