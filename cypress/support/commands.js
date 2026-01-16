// Minimal, fast custom commands

// Remove all popups immediately
Cypress.Commands.add('killPopups', () => {
  cy.window().then((win) => {
    // Kill anything with high z-index that's fixed
    win.document.querySelectorAll('[role="dialog"], [aria-modal="true"], [class*="klaviyo"], [class*="popup"]').forEach(el => {
      el.remove();
    });
  });
});

// Fast page load - just wait for document ready
Cypress.Commands.add('fastVisit', (url) => {
  cy.visit(url, { failOnStatusCode: false });
  cy.document().its('readyState').should('eq', 'complete');
  cy.killPopups();
});

// Scroll to product form area
Cypress.Commands.add('scrollToProductForm', () => {
  cy.get('.product-form, .product__info-wrapper, [class*="product"]').first()
    .scrollIntoView({ offset: { top: -250, left: 0 } });
});

// Add to cart with force click
Cypress.Commands.add('forceAddToCart', () => {
  cy.scrollToProductForm();
  cy.get('.product-form__submit, button[name="add"], #ProductSubmitButton-template--17653238202535__main')
    .first()
    .click({ force: true });
});

// Open cart
Cypress.Commands.add('openCart', () => {
  cy.get('#cart-icon-bubble, [href="/cart"], .cart-icon').first().click({ force: true });
});
