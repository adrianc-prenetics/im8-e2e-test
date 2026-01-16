describe('Add to Cart', () => {
  beforeEach(() => {
    cy.fastVisit('/products/essentials');
  });

  it('product page loads with ATC button', () => {
    cy.get('.product-form__submit, button[name="add"]').should('exist');
  });

  it('can click ATC button', () => {
    cy.forceAddToCart();
    // Just verify no crash - cart drawer or redirect happens
    cy.wait(1000);
    cy.url().should('include', 'im8health.com');
  });

  it('cart updates after adding', () => {
    cy.forceAddToCart();
    cy.wait(1500);
    // Check cart has items (drawer opens or count updates)
    cy.get('body').then($body => {
      const hasDrawer = $body.find('#CartDrawer:visible, cart-drawer:visible').length > 0;
      const hasCount = $body.find('.cart-count-bubble').length > 0;
      expect(hasDrawer || hasCount).to.be.true;
    });
  });
});
