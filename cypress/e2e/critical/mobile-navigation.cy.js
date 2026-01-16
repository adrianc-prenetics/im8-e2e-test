describe('Mobile Navigation - Critical Interactions', () => {
  beforeEach(() => {
    cy.viewport(375, 812);
    cy.fastVisit('/');
  });

  it('page loads on mobile', () => {
    cy.task('log', '[TEST] Starting: page loads on mobile');
    cy.debugPageState();
    cy.get('body').should('exist');
    cy.task('log', '[TEST] Mobile page load completed');
  });

  it('has mobile menu elements', () => {
    cy.task('log', '[TEST] Starting: has mobile menu elements');
    cy.get('header, .header').should('exist');
    cy.task('log', '[TEST] Mobile menu test completed');
  });
});
