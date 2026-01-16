// Minimal, fast custom commands

// Remove all popups immediately via JavaScript
Cypress.Commands.add('killPopups', () => {
  cy.window().then((win) => {
    // Remove Klaviyo popups and dialogs
    win.document.querySelectorAll('[role="dialog"], [aria-modal="true"]').forEach(el => {
      el.remove();
    });
    // Remove elements with klaviyo or popup in class
    win.document.querySelectorAll('[class*="klaviyo"], [class*="popup"], .needsclick').forEach(el => {
      el.remove();
    });
  });
  // Click accept on cookie banner using Cypress (jQuery-style)
  cy.get('body').then($body => {
    const acceptBtn = $body.find('button:contains("Accept")');
    if (acceptBtn.length) {
      cy.wrap(acceptBtn.first()).click({ force: true });
    }
  });
});

// Fast page load - wait for ready then kill popups
Cypress.Commands.add('fastVisit', (url) => {
  cy.visit(url, { failOnStatusCode: false });
  cy.document().its('readyState').should('eq', 'complete');
  cy.wait(1000);
  cy.killPopups();
});

// Add to cart with force click
Cypress.Commands.add('forceAddToCart', () => {
  cy.killPopups();
  // Use Cypress contains which supports jQuery-style selectors
  cy.get('button[name="add"], button[type="submit"]').first()
    .scrollIntoView({ offset: { top: -300, left: 0 } })
    .click({ force: true });
});

// Open cart drawer
Cypress.Commands.add('openCart', () => {
  cy.get('#cart-icon-bubble, [href="/cart"]').first().click({ force: true });
});
