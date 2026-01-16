describe('Header Navigation - Critical Interactions', () => {
  beforeEach(() => {
    cy.fastVisit('/');
  });

  it('header and logo exist', () => {
    cy.get('header, banner').should('exist');
    cy.get('a[href="/"], [class*="logo"]').should('exist');
  });

  it('cart icon is clickable', () => {
    cy.killPopups();
    cy.get('button[aria-label*="Cart"], button:contains("Cart"), #cart-icon-bubble').first().click({ force: true });
    cy.wait(500);
    cy.get('#CartDrawer, cart-drawer').should('exist');
  });

  it('navigation links exist', () => {
    cy.get('header nav a, header a').should('have.length.greaterThan', 0);
  });
});
