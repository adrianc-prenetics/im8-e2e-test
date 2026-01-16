describe('Header Navigation', () => {
  beforeEach(() => {
    cy.fastVisit('/');
  });

  it('header exists and is visible', () => {
    cy.get('header').should('exist');
  });

  it('logo is clickable', () => {
    cy.get('header a[href="/"], .header__heading-logo, [class*="logo"]').first().should('exist');
  });

  it('cart icon exists', () => {
    cy.get('#cart-icon-bubble, [href="/cart"], [class*="cart"]').first().should('exist');
  });
});
