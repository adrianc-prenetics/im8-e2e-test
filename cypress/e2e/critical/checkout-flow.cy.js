describe('Checkout Flow - Critical Interactions', () => {
  it('can navigate to checkout', () => {
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(2000);
    
    // Try checkout button or go to cart page
    cy.get('body').then($body => {
      const checkoutBtn = $body.find('button[name="checkout"], a[href*="checkout"]');
      if (checkoutBtn.length > 0) {
        cy.wrap(checkoutBtn.first()).click({ force: true });
      } else {
        cy.visit('/cart');
        cy.get('button[name="checkout"], a[href*="checkout"]').first().click({ force: true });
      }
    });
    
    cy.url({ timeout: 15000 }).should('include', 'checkout');
  });
});
