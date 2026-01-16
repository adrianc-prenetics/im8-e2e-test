describe('Homepage', () => {
  it('loads successfully', () => {
    cy.fastVisit('/');
    cy.get('header').should('exist');
    cy.get('body').should('be.visible');
  });

  it('has clickable cart icon', () => {
    cy.fastVisit('/');
    cy.get('#cart-icon-bubble, [href="/cart"]').first().should('exist');
  });
});
