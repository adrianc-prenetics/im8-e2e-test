// Minimal, fast custom commands

// Remove all popups immediately via JavaScript
Cypress.Commands.add('killPopups', () => {
  cy.window().then((win) => {
    // Remove Klaviyo popups
    win.document.querySelectorAll('[role="dialog"], [aria-modal="true"], [class*="klaviyo"], [class*="popup"], .needsclick').forEach(el => {
      el.remove();
    });
    // Remove cookie banner
    const cookieBtn = win.document.querySelector('button:contains("Accept"), button.accept');
    if (cookieBtn) cookieBtn.click();
  });
  // Also try clicking accept on cookie banner
  cy.get('body').then($body => {
    if ($body.find('button:contains("Accept")').length) {
      cy.contains('button', 'Accept').click({ force: true });
    }
  });
});

// Fast page load - wait for ready then kill popups
Cypress.Commands.add('fastVisit', (url) => {
  cy.visit(url, { failOnStatusCode: false });
  cy.document().its('readyState').should('eq', 'complete');
  cy.wait(1000); // Let page settle
  cy.killPopups();
});

// Scroll to product form area (the actual product info section)
Cypress.Commands.add('scrollToProductForm', () => {
  // The product form is inside a section with product info
  cy.get('button[type="submit"][name="add"], .product-form__submit, button:contains("TRANSFORMATION"), button:contains("Add to cart")')
    .first()
    .scrollIntoView({ offset: { top: -300, left: 0 } });
  cy.wait(300);
});

// Add to cart with force click - using actual button selectors from the site
Cypress.Commands.add('forceAddToCart', () => {
  cy.killPopups();
  // The main ATC button contains "TRANSFORMATION" or "Add to cart"
  cy.get('button[type="submit"][name="add"], button:contains("TRANSFORMATION"), button:contains("Add to cart"), #ProductSubmitButton-template--17653238202535__main')
    .first()
    .scrollIntoView({ offset: { top: -300, left: 0 } })
    .click({ force: true });
});

// Open cart drawer
Cypress.Commands.add('openCart', () => {
  cy.get('button[aria-label*="Cart"], #cart-icon-bubble, [href="/cart"]').first().click({ force: true });
});
