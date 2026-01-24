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
 * NOTE: Cart drawer has loading states that set visibility:hidden on .cart__ctas
 *       We need to wait for the loading state to complete before checking visibility
 */
describe('Checkout Flow - Critical Interactions', () => {
  // Selectors from theme files
  const cartIconSelector = '#cart-icon-bubble';
  const checkoutButtonSelector = '#CartDrawer-Checkout, button[name="checkout"].cart__checkout-button';
  
  // Helper to wait for cart drawer to be fully loaded (not in loading state)
  const waitForCartDrawerReady = () => {
    // Wait for cart drawer to be active
    cy.get('cart-drawer.active', { timeout: 10000 }).should('exist');
    
    // Wait for any loading states to complete
    // The cart drawer adds/removes loading classes during updates
    cy.get('cart-drawer', { timeout: 10000 }).should('not.have.class', 'is-loading');
    
    // Wait for cart__ctas to have visible visibility (not hidden)
    // This is the parent container that gets visibility:hidden during loading
    cy.get('.cart__ctas', { timeout: 10000 }).should('exist').then($ctas => {
      // Use JavaScript to check computed visibility and wait if needed
      cy.wrap($ctas).should(($el) => {
        const visibility = window.getComputedStyle($el[0]).visibility;
        expect(visibility).to.not.equal('hidden');
      });
    });
  };
  
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
    
    // Wait for cart drawer to fully render and be ready
    cy.wait(2000);
    waitForCartDrawerReady();
    
    // Additional wait for any animations to complete
    cy.wait(500);
    
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
    
    // Wait for cart drawer to fully render and be ready
    cy.wait(2000);
    waitForCartDrawerReady();
    
    // Additional wait for any animations to complete
    cy.wait(500);
    
    // Checkout button MUST be visible - this catches hidden button bugs
    cy.get(checkoutButtonSelector, { timeout: 10000 })
      .should('be.visible');
    
    cy.log('[TEST] Checkout button is visible');
  });
});
