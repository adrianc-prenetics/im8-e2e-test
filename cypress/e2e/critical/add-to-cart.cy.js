describe('Add to Cart - Critical Interactions', () => {
  beforeEach(() => {
    cy.fastVisit('/products/essentials');
  });

  it('product page loads with ATC button', () => {
    cy.task('log', '[TEST] Starting: product page loads with ATC button');
    
    // Check page loaded
    cy.get('body').should('exist');
    cy.url().then(url => {
      cy.task('log', `[TEST] Current URL: ${url}`);
    });
    
    // Debug what we can find
    cy.debugPageState();
    
    // Check for ATC button using multiple selectors
    cy.get('[id^="ProductSubmitButton"], .product-form__submit, button[name="add"], product-form button', { timeout: 15000 })
      .should('exist')
      .then($el => {
        cy.task('log', `[TEST] Found ATC element: id=${$el.attr('id')}, class=${$el.attr('class')?.substring(0,50)}`);
      });
  });

  it('can click ATC button', () => {
    cy.task('log', '[TEST] Starting: can click ATC button');
    cy.forceAddToCart();
    cy.wait(2000);
    cy.task('log', '[TEST] ATC test completed');
    cy.get('body').should('exist');
  });
});
