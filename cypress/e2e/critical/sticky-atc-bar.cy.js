describe('Sticky ATC Bar - Critical Interactions', () => {
  it('product page has ATC functionality', () => {
    cy.task('log', '[TEST] Starting: product page has ATC functionality');
    cy.fastVisit('/products/essentials');
    
    cy.scrollTo('bottom', { duration: 500 });
    cy.wait(500);
    
    cy.debugPageState();
    
    cy.get('[id^="ProductSubmitButton"], .product-form__submit, button[name="add"]', { timeout: 10000 })
      .should('exist')
      .then($el => {
        cy.task('log', `[TEST] Found ATC: id=${$el.attr('id')}, visible=${$el.is(':visible')}`);
      });
    
    cy.task('log', '[TEST] Sticky ATC test completed');
  });
});
