describe('Homepage - Critical Interactions', () => {
  it('homepage loads', () => {
    cy.task('log', '[TEST] Starting: homepage loads');
    cy.fastVisit('/');
    
    cy.get('body').should('exist');
    cy.url().then(url => {
      cy.task('log', `[TEST] Final URL: ${url}`);
    });
    
    // Check if we got redirected to password page
    cy.get('body').then($body => {
      const hasPasswordForm = $body.find('form[action*="password"]').length > 0;
      cy.task('log', `[TEST] Has password form: ${hasPasswordForm}`);
      
      if (hasPasswordForm) {
        cy.task('log', '[TEST] WARNING: Site appears to be password protected!');
      }
    });
  });

  it('has product links', () => {
    cy.task('log', '[TEST] Starting: has product links');
    cy.fastVisit('/');
    
    cy.get('a[href*="/products/"]').then($links => {
      cy.task('log', `[TEST] Found ${$links.length} product links`);
    });
    
    cy.get('a[href*="/products/"]').should('have.length.greaterThan', 0);
  });
});
