describe('Homepage - Critical Interactions', () => {
  it('homepage loads', () => {
    cy.fastVisit('/');
    cy.get('body').should('be.visible');
  });

  it('can navigate to product page', () => {
    cy.fastVisit('/');
    cy.killPopups();
    cy.get('a[href*="/products/"]').first().click({ force: true });
    cy.url().should('include', '/products/');
  });
});
