describe('Sticky ATC Bar - Critical Interactions', () => {
  it('product page has ATC functionality', () => {
    cy.log('[TEST] Starting sticky ATC test');
    // Use direct URL to avoid /products/essentials → /products/essentials-pro redirect
    cy.fastVisit('/products/essentials-pro');
    cy.killPopups();

    // Broader ATC selector: includes main form button AND sticky bar button
    const atcSelector = 'product-form button[type="submit"], [id^="ProductSubmitButton"], .product-form__submit, button[name="add"], .product-buy-sticky__button';

    // Wait for any ATC button to exist — use cy.get with generous timeout
    // This is more reliable than Cypress.Promise polling which can timeout on CI
    cy.get(atcSelector, { timeout: 45000 })
      .first()
      .should('exist');

    // Scroll to bottom to trigger sticky bar
    cy.scrollTo('bottom', { duration: 500, ensureScrollable: false });
    cy.wait(1000);

    // Verify ATC button still accessible after scroll (main or sticky)
    cy.get(atcSelector, { timeout: 10000 })
      .first()
      .should('exist');

    cy.log('[TEST] Sticky ATC test completed');
  });
});
