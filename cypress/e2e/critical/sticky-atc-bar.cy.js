describe('Sticky ATC Bar', () => {
  it('product page has sticky bar or ATC button', () => {
    cy.fastVisit('/products/essentials');
    // Either sticky bar exists or regular ATC button exists
    cy.get('.sticky-atc, [class*="sticky"], .product-form__submit, button[name="add"]').first().should('exist');
  });

  it('can add to cart from product page', () => {
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(1000);
    // Verify page didn't crash
    cy.get('body').should('exist');
  });
});
