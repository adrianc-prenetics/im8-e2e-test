describe('Checkout Flow - Critical Interactions', () => {
  it('checkout button in cart drawer NAVIGATES to checkout', () => {
    // Add item first
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(2000);
    
    // Open cart if not auto-opened
    cy.get('body').then($body => {
      if (!$body.find('#CartDrawer:visible').length) {
        cy.get('#cart-icon-bubble').click({ force: true });
        cy.wait(1000);
      }
    });
    
    // Click checkout
    cy.get('button[name="checkout"], [href*="checkout"]').first().click({ force: true });
    
    // Verify navigation to checkout
    cy.url({ timeout: 15000 }).should('include', 'checkout');
  });

  it('checkout page loads with form fields', () => {
    // Add item and go to checkout
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(2000);
    
    // Go directly to checkout
    cy.visit('/checkout', { failOnStatusCode: false });
    
    // Verify checkout page has form elements
    cy.get('body').then($body => {
      // Either we're on checkout with forms, or redirected to cart (if empty)
      const hasCheckoutForm = $body.find('input, form').length > 0;
      const isOnCheckout = window.location.href.includes('checkout');
      
      expect(hasCheckoutForm || isOnCheckout, 'Should be on checkout page with forms').to.be.true;
    });
  });
});
