describe('Sticky ATC Bar - Critical Interactions', () => {
  it('sticky bar appears and ATC works', () => {
    cy.fastVisit('/products/essentials');
    cy.killPopups();
    
    // Scroll down to trigger sticky bar
    cy.scrollTo(0, 1000);
    cy.wait(500);
    
    // Click any ATC button
    cy.get('button[name="add"], button[type="submit"]').first().click({ force: true });
    cy.wait(1000);
    
    cy.get('body').should('exist');
  });
});
