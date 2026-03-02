describe('Homepage - Critical Interactions', () => {
  it('homepage loads', () => {
    cy.log('[TEST] Starting homepage test');
    cy.fastVisit('/');

    cy.get('body').should('exist');
    cy.url().should('include', 'im8health.com');

    cy.log('[TEST] Homepage loaded successfully');
  });

  it('has product links', () => {
    cy.log('[TEST] Checking for product links');
    cy.fastVisit('/');

    // Generous timeout for CI where page sections load slowly
    cy.get('a[href*="/products/"]', { timeout: 30000 })
      .should('have.length.greaterThan', 0);

    cy.log('[TEST] Product links found');
  });
});
