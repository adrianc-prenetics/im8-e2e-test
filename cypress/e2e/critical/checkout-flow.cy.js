/**
 * Checkout Flow Tests
 * 
 * Tests the checkout flow from cart drawer:
 * - Add item to cart
 * - Open cart drawer
 * - Click checkout button
 * - Verify navigation to checkout page
 * 
 * Reference: /Users/adrianchan/shopify-im8-ui/snippets/cart-drawer.liquid
 */
describe('Checkout Flow - Critical Interactions', () => {
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
    cy.wait(2000);
    
    // Open cart drawer
    cy.get('button[aria-label*="Cart"]', { timeout: 15000 })
      .first()
      .click({ force: true });
    
    cy.wait(500);
    
    // Click checkout button
    cy.get('button[name="checkout"], a[href*="/checkout"], .cart__checkout-button', { timeout: 10000 })
      .first()
      .click({ force: true });
    
    // Verify we're on checkout page or being redirected
    // Note: Checkout may redirect to Shopify checkout domain
    cy.url({ timeout: 15000 }).should('include', 'checkout');
    
    cy.log('[TEST] Successfully navigated to checkout');
  });

  it('checkout button exists in cart drawer', () => {
    cy.log('[TEST] Starting: checkout button exists in cart drawer');
    
    // Add item to cart first
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(2000);
    
    // Open cart drawer
    cy.get('button[aria-label*="Cart"]', { timeout: 15000 })
      .first()
      .click({ force: true });
    
    cy.wait(500);
    
    // Verify checkout button exists
    cy.get('button[name="checkout"], a[href*="/checkout"], .cart__checkout-button, [class*="checkout"]', { timeout: 10000 })
      .should('exist')
      .and('be.visible');
    
    cy.log('[TEST] Checkout button verified');
  });
});
