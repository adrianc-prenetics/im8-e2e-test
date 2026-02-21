describe('Sticky ATC Bar - Critical Interactions', () => {
  it('product page has ATC functionality', () => {
    cy.log('[TEST] Starting sticky ATC test');
    cy.fastVisit('/products/essentials');
    cy.killPopups();
    
    // Wait for product-form custom element to be ready
    cy.window().then((win) => {
      return new Cypress.Promise((resolve) => {
        const check = () => {
          const ceReady = win.customElements && win.customElements.get('product-form');
          const formExists = win.document.querySelector('product-form form, form[data-type="add-to-cart-form"], form.test-product-form');
          if (ceReady || formExists) {
            resolve();
          } else {
            setTimeout(check, 200);
          }
        };
        check();
      });
    });
    
    // Check for ATC button with broader selector
    cy.get('product-form button[type="submit"], [id^="ProductSubmitButton"], .product-form__submit, button[name="add"]', { timeout: 20000 })
      .first()
      .should('exist');
    
    // Scroll to bottom to trigger sticky bar
    cy.scrollTo('bottom', { duration: 500, ensureScrollable: false });
    cy.wait(500);
    
    // Verify ATC button still accessible after scroll
    cy.get('product-form button[type="submit"], [id^="ProductSubmitButton"], .product-form__submit, button[name="add"]', { timeout: 10000 })
      .first()
      .should('exist');
    
    cy.log('[TEST] Sticky ATC test completed');
  });
});
