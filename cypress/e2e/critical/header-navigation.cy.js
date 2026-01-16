describe('Header Navigation - Critical Interactions', () => {
  beforeEach(() => {
    cy.fastVisit('/');
  });

  it('header exists with logo', () => {
    cy.log('[TEST] Starting: header exists with logo');
    
    // Based on live site, header uses banner role
    cy.get('header, [role="banner"], .header', { timeout: 15000 }).should('exist');
    
    // Logo link to homepage
    cy.get('a[href="/"]', { timeout: 10000 }).should('exist');
    
    cy.log('[TEST] Header test completed');
  });

  it('navigation links exist', () => {
    cy.log('[TEST] Starting: navigation links exist');
    
    // Based on live site, nav links are in navigation element
    cy.get('nav a, [role="navigation"] a', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
    
    cy.log('[TEST] Navigation links found');
  });
});
