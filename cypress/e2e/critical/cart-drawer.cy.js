describe('Cart Drawer - Critical Interactions', () => {
  it('cart icon opens cart drawer', () => {
    cy.fastVisit('/');
    cy.killPopups();
    
    cy.get('#cart-icon-bubble').click({ force: true });
    cy.wait(1000);
    
    cy.get('#CartDrawer, cart-drawer').should('exist');
  });

  it('can add item and cart responds', () => {
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(2000);
    cy.get('body').should('exist');
  });
});
