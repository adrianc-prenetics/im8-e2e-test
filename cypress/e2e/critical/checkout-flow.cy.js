describe('Checkout Flow', () => {
  it('can reach checkout from product page', () => {
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(1500);
    
    // Try to find and click checkout button
    cy.get('body').then($body => {
      if ($body.find('button[name="checkout"]:visible').length > 0) {
        cy.get('button[name="checkout"]').first().click({ force: true });
      } else if ($body.find('[href*="checkout"]').length > 0) {
        cy.get('[href*="checkout"]').first().click({ force: true });
      } else {
        // Go to cart page and checkout from there
        cy.visit('/cart');
        cy.get('button[name="checkout"], [name="checkout"]').first().click({ force: true });
      }
    });
    
    // Verify we're heading to checkout
    cy.url({ timeout: 10000 }).should('include', 'checkout');
  });
});
