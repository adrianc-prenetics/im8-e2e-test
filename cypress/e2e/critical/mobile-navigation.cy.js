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
    cy.get('header-drawer summary, [class*="menu-icon"], [class*="hamburger"]')
      .first()
      .click({ force: true });
    cy.wait(500);
    
    cy.get('#menu-drawer, [class*="menu-drawer"]').should('exist');
  });

  it('cart works on mobile', () => {
    cy.killPopups();
    cy.get('#cart-icon-bubble').click({ force: true });
    cy.wait(500);
    cy.get('#CartDrawer, cart-drawer').should('exist');
  });
});
