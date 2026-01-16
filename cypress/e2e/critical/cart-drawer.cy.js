describe('Cart Drawer - Critical Interactions', () => {
  it('clicking cart icon OPENS the cart drawer', () => {
    cy.fastVisit('/');
    
    // Click cart icon
    cy.get('#cart-icon-bubble').should('be.visible').click({ force: true });
    cy.wait(1000);
    
    // Verify drawer opened
    cy.get('#CartDrawer, cart-drawer').should('be.visible');
  });

  it('cart drawer shows checkout button', () => {
    // First add an item
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
    
    // Verify checkout button exists
    cy.get('#CartDrawer button[name="checkout"], #CartDrawer [href*="checkout"], cart-drawer button[name="checkout"]')
      .should('exist');
  });

  it('cart drawer can be closed', () => {
    cy.fastVisit('/');
    
    // Open cart
    cy.get('#cart-icon-bubble').click({ force: true });
    cy.wait(500);
    cy.get('#CartDrawer').should('be.visible');
    
    // Close cart (click X or outside)
    cy.get('#CartDrawer .drawer__close, #CartDrawer [class*="close"]').first().click({ force: true });
    cy.wait(500);
    
    // Verify closed
    cy.get('#CartDrawer').should('not.be.visible');
  });
});
