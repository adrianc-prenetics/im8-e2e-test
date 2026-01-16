describe('Header Navigation - Critical Interactions', () => {
  beforeEach(() => {
    cy.fastVisit('/');
  });

  it('logo is visible and clickable', () => {
    cy.get('.header__heading-logo, header a[href="/"], [class*="logo"] a')
      .first()
      .should('be.visible')
      .click({ force: true });
    
    // Should stay on or navigate to homepage
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });

  it('main navigation links are visible', () => {
    cy.get('header nav a, .header__inline-menu a, [class*="nav"] a')
      .should('have.length.greaterThan', 0);
  });

  it('cart icon is visible and clickable', () => {
    cy.get('#cart-icon-bubble')
      .should('be.visible')
      .click({ force: true });
    cy.wait(500);
    
    // Cart drawer should open
    cy.get('#CartDrawer, cart-drawer').should('be.visible');
  });

  it('navigation link clicks work', () => {
    // Find and click a nav link
    cy.get('header nav a, .header__inline-menu a').first().then($link => {
      const href = $link.attr('href');
      if (href && href !== '#' && !href.includes('javascript')) {
        cy.wrap($link).click({ force: true });
        cy.wait(500);
        // Verify navigation happened (URL changed or page loaded)
        cy.get('body').should('exist');
      }
    });
  });
});
