describe('Checkout Flow - Critical Interactions', () => {
  it('can navigate to checkout', () => {
    // Add item first
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(2000);
    
    // Try to get to checkout - either via drawer button or direct navigation
    cy.get('body').then($body => {
      const checkoutBtn = $body.find('button[name="checkout"], a[href*="checkout"]');
      if (checkoutBtn.length > 0) {
        cy.wrap(checkoutBtn.first()).click({ force: true });
      } else {
        // Go to cart page directly
        cy.visit('/cart');
        cy.get('button[name="checkout"], a[href*="checkout"]').first().click({ force: true });
      }
    });
    
    // Should reach checkout
    cy.url({ timeout: 15000 }).should('include', 'checkout');
  });
});
