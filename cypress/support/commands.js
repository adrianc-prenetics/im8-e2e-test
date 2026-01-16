// Minimal, fast custom commands

// Remove all popups via JavaScript
Cypress.Commands.add('killPopups', () => {
  cy.window().then((win) => {
    const selectors = '[role="dialog"], [aria-modal="true"], [class*="klaviyo"], [class*="popup"], .needsclick';
    win.document.querySelectorAll(selectors).forEach(el => {
      try { el.remove(); } catch (e) { /* ignore */ }
    });
  });
});

// Fast page load
Cypress.Commands.add('fastVisit', (url) => {
  cy.visit(url, { failOnStatusCode: false });
  cy.get('body', { timeout: 15000 }).should('exist');
  cy.wait(1000);
  cy.killPopups();
});

// Add to cart - using actual selectors from the theme:
// Button has: id="ProductSubmitButton-{section_id}", name="add", class="product-form__submit"
Cypress.Commands.add('forceAddToCart', () => {
  cy.killPopups();
  cy.get('[id^="ProductSubmitButton"], .product-form__submit', { timeout: 10000 })
    .first()
    .scrollIntoView({ offset: { top: -300, left: 0 } })
    .click({ force: true });
});

// Open cart drawer
Cypress.Commands.add('openCart', () => {
  cy.get('#cart-icon-bubble, [href="/cart"]').first().click({ force: true });
});
