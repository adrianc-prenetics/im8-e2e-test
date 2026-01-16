describe('Header Navigation - Critical Interactions', () => {
  beforeEach(() => {
    cy.fastVisit('/');
  });

  it('header exists with logo', () => {
    cy.task('log', '[TEST] Starting: header exists with logo');
    cy.debugPageState();
    
    cy.get('header, .header', { timeout: 15000 }).should('exist');
    cy.get('a[href="/"], .header__heading-logo, img[alt*="IM8"]').should('exist');
    cy.task('log', '[TEST] Header test completed');
  });

  it('navigation links exist', () => {
    cy.task('log', '[TEST] Starting: navigation links exist');
    cy.get('nav a, .header a').then($links => {
      cy.task('log', `[TEST] Found ${$links.length} nav links`);
    });
    cy.get('nav a, .header a').should('have.length.greaterThan', 0);
  });
});
