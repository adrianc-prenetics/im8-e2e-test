describe('Mobile Navigation', () => {
  beforeEach(() => {
    cy.viewport(375, 812);
    cy.fastVisit('/');
  });

  it('page loads on mobile', () => {
    cy.get('body').should('be.visible');
  });

  it('hamburger menu exists', () => {
    cy.get('[class*="menu"], [class*="hamburger"], summary[class*="icon"]').first().should('exist');
  });
});
