describe('Header Navigation - Critical Interactions', () => {
  beforeEach(() => {
    cy.fastVisit('/');
  });

  it('header and logo exist', () => {
    cy.get('header, [role="banner"]').should('exist');
    cy.get('a[href="/"]').should('exist');
  });

  it('cart icon is clickable', () => {
    cy.killPopups();
    cy.get('#cart-icon-bubble').click({ force: true });
    cy.wait(500);
    cy.get('#CartDrawer, cart-drawer').should('exist');
  });

  it('navigation links exist', () => {
    cy.get('header a').should('have.length.greaterThan', 0);
  });
});
