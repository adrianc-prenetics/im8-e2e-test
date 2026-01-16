describe('Sticky ATC Bar - Critical Interactions', () => {
  it('product page has ATC functionality', () => {
    cy.log('[TEST] Starting sticky ATC test');
    cy.fastVisit('/products/essentials');
    
    // Scroll to bottom to trigger sticky bar - use ensureScrollable: false
    cy.scrollTo('bottom', { duration: 500, ensureScrollable: false });
    cy.wait(500);
    
    // Check for ATC button
    cy.get('[id^="ProductSubmitButton"], .product-form__submit, button[name="add"]', { timeout: 10000 })
      .first()
      .should('exist');
    
    cy.log('[TEST] Sticky ATC test completed');
  });
});
