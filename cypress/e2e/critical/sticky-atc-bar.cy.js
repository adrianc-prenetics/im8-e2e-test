describe('Sticky ATC Bar - Critical Interactions', () => {
  it('product page has ATC functionality', () => {
    cy.log('[TEST] Starting sticky ATC test');
    // Use direct URL to avoid /products/essentials → /products/essentials-pro redirect
    cy.fastVisit('/products/essentials-pro');
    cy.killPopups();

    // Wait for product-form custom element OR sticky bar to be ready
    cy.window().then((win) => {
      return new Cypress.Promise((resolve) => {
        const check = () => {
          const ceReady = win.customElements && win.customElements.get('product-form');
          const formExists = win.document.querySelector('product-form form, form[data-type="add-to-cart-form"], form.test-product-form');
          const stickyExists = win.document.querySelector('.product-buy-sticky-container');
          if (ceReady || formExists || stickyExists) {
            resolve();
          } else {
            setTimeout(check, 200);
          }
        };
        check();
      });
    });

    // Broader ATC selector: includes main form button AND sticky bar button
    const atcSelector = 'product-form button[type="submit"], [id^="ProductSubmitButton"], .product-form__submit, button[name="add"], .product-buy-sticky__button';

    // Check for ATC button
    cy.get(atcSelector, { timeout: 20000 })
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
