describe('Mobile Navigation - Critical Interactions', () => {
  beforeEach(() => {
    cy.viewport(375, 812);
    cy.fastVisit('/');
  });

  it('hamburger menu button is visible on mobile', () => {
    cy.get('header-drawer summary, .header__icon--menu, [class*="hamburger"], button[aria-label*="Menu"]')
      .first()
      .should('be.visible');
  });

  it('clicking hamburger OPENS the mobile menu drawer', () => {
    // Click hamburger
    cy.get('header-drawer summary, .header__icon--menu, [class*="hamburger"]')
      .first()
      .click({ force: true });
    cy.wait(500);
    
    // Verify menu drawer opened
    cy.get('#menu-drawer, .menu-drawer, [class*="nav-drawer"], [class*="mobile-menu"]')
      .should('be.visible');
  });

  it('mobile menu contains navigation links', () => {
    // Open menu
    cy.get('header-drawer summary, .header__icon--menu').first().click({ force: true });
    cy.wait(500);
    
    // Verify menu has links
    cy.get('#menu-drawer a, .menu-drawer a, [class*="mobile-menu"] a')
      .should('have.length.greaterThan', 0);
  });

  it('mobile menu can be closed', () => {
    // Open menu
    cy.get('header-drawer summary, .header__icon--menu').first().click({ force: true });
    cy.wait(500);
    cy.get('#menu-drawer, .menu-drawer').should('be.visible');
    
    // Close menu
    cy.get('.menu-drawer__close-button, [class*="close"], #menu-drawer summary')
      .first()
      .click({ force: true });
    cy.wait(500);
    
    // Verify closed
    cy.get('#menu-drawer, .menu-drawer').should('not.be.visible');
  });

  it('cart icon works on mobile', () => {
    cy.get('#cart-icon-bubble').should('be.visible').click({ force: true });
    cy.wait(500);
    cy.get('#CartDrawer, cart-drawer').should('be.visible');
  });
});
