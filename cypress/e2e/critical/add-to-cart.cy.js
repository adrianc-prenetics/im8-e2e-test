describe('Add to Cart - Critical Interactions', () => {
  beforeEach(() => {
    cy.log('[TEST] Starting test - visiting product page');
    cy.fastVisit('/products/essentials');
  });

  it('product page loads with ATC button', () => {
    cy.log('[TEST] Checking for ATC button');
    
    // Check page loaded
    cy.get('body').should('exist');
    cy.url().should('include', '/products/');
    
    // Check for ATC button using multiple selectors
    cy.get('[id^="ProductSubmitButton"], .product-form__submit, button[name="add"], product-form button', { timeout: 15000 })
      .first()
      .should('exist');
    
    cy.log('[TEST] ATC button found');
  });

  it('can click ATC button', () => {
    cy.log('[TEST] Testing ATC click');
    cy.forceAddToCart();
    cy.wait(2000);
    cy.log('[TEST] ATC click completed');
  });
});
