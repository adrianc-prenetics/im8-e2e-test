// Minimal, fast custom commands

// Remove all popups via JavaScript - safe version that doesn't fail
Cypress.Commands.add('killPopups', () => {
  cy.window().then((win) => {
    // Remove Klaviyo popups and dialogs
    const selectors = '[role="dialog"], [aria-modal="true"], [class*="klaviyo"], [class*="popup"], .needsclick';
    win.document.querySelectorAll(selectors).forEach(el => {
      try { el.remove(); } catch (e) { /* ignore */ }
    });
    // Try to click cookie accept button
    const acceptBtn = win.document.querySelector('button.accept, [class*="accept"]');
    if (acceptBtn) {
      try { acceptBtn.click(); } catch (e) { /* ignore */ }
    }
  });
});

// Fast page load
Cypress.Commands.add('fastVisit', (url) => {
  cy.visit(url, { failOnStatusCode: false });
  cy.get('body', { timeout: 15000 }).should('exist');
  cy.wait(500);
  cy.killPopups();
});

// Add to cart with force click
Cypress.Commands.add('forceAddToCart', () => {
  cy.killPopups();
  cy.get('button[name="add"], button[type="submit"]', { timeout: 10000 })
    .first()
    .scrollIntoView({ offset: { top: -300, left: 0 } })
    .click({ force: true });
});

// Open cart drawer
Cypress.Commands.add('openCart', () => {
  cy.get('#cart-icon-bubble, [href="/cart"]').first().click({ force: true });
});
