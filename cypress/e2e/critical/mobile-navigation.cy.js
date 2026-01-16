describe('Mobile Navigation - Critical Interactions', () => {
  beforeEach(() => {
    cy.viewport(375, 812);
    cy.fastVisit('/');
  });

  it('page loads on mobile', () => {
    cy.get('body').should('be.visible');
  });

  it('hamburger menu opens drawer', () => {
    cy.killPopups();
    // Look for hamburger/menu button
    cy.get('header-drawer summary, button[aria-label*="Menu"], [class*="hamburger"], [class*="menu-icon"]')
      .first()
      .click({ force: true });
    cy.wait(500);
    
    // Menu drawer should appear
    cy.get('#menu-drawer, [class*="menu-drawer"], [class*="mobile-nav"]').should('exist');
  });

  it('cart works on mobile', () => {
    cy.killPopups();
    cy.get('button[aria-label*="Cart"], #cart-icon-bubble').first().click({ force: true });
    cy.wait(500);
    cy.get('#CartDrawer, cart-drawer').should('exist');
  });
});
