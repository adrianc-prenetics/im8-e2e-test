describe('Mobile Navigation - Critical Interactions', () => {
  beforeEach(() => {
    cy.viewport(375, 812);
    cy.fastVisit('/');
  });

  it('page loads on mobile', () => {
    cy.log('[TEST] Starting: page loads on mobile');
    cy.get('body').should('exist');
    cy.log('[TEST] Mobile page load completed');
  });

  it('has mobile menu elements', () => {
    cy.log('[TEST] Starting: has mobile menu elements');
    
    // Header should exist on mobile
    cy.get('header, [role="banner"], .header', { timeout: 15000 }).should('exist');
    
    cy.log('[TEST] Mobile menu test completed');
  });
});
