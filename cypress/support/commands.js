// Minimal, fast custom commands

// Remove all popups via JavaScript - using only valid native selectors
Cypress.Commands.add('killPopups', () => {
  cy.window().then((win) => {
    try {
      // Hide popups using native selectors only
      const popupSelectors = [
        '[role="dialog"]',
        '[aria-modal="true"]',
        '[class*="klaviyo"]',
        '[class*="popup"]',
        '.needsclick'
      ];
      
      popupSelectors.forEach(selector => {
        try {
          const elements = win.document.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
          });
          if (elements.length > 0) {
            console.log(`[IM8-TEST] Hidden ${elements.length} elements matching: ${selector}`);
          }
        } catch (e) {
          // Ignore selector errors
        }
      });
    } catch (e) {
      console.log('[IM8-TEST] killPopups error:', e.message);
    }
  });
});

// Fast page load - simplified, no jQuery selectors
Cypress.Commands.add('fastVisit', (url) => {
  cy.log(`[IM8-TEST] Visiting: ${url}`);
  
  cy.visit(url, { failOnStatusCode: false });
  
  // Wait for body to exist
  cy.get('body', { timeout: 30000 }).should('exist');
  cy.log('[IM8-TEST] Body exists');
  
  // Wait for page to stabilize
  cy.wait(1500);
  
  // Kill popups
  cy.killPopups();
  
  // Accept cookie consent using Cypress jQuery selector (not native)
  cy.get('body').then($body => {
    // Use jQuery filter to find accept button
    const acceptBtn = $body.find('button').filter(function() {
      return $(this).text().toLowerCase().includes('accept');
    });
    if (acceptBtn.length > 0) {
      cy.wrap(acceptBtn.first()).click({ force: true });
      cy.log('[IM8-TEST] Clicked cookie accept');
    }
  });
});

// Add to cart with force click
Cypress.Commands.add('forceAddToCart', () => {
  cy.log('[IM8-TEST] forceAddToCart starting...');
  cy.killPopups();
  
  const selectors = [
    '[id^="ProductSubmitButton"]',
    '.product-form__submit',
    'button[name="add"]',
    'form[action*="/cart/add"] button[type="submit"]',
    'product-form button[type="submit"]'
  ];
  
  // Try each selector
  cy.get('body').then($body => {
    for (const selector of selectors) {
      const count = $body.find(selector).length;
      console.log(`[IM8-TEST] Selector "${selector}" found: ${count}`);
      
      if (count > 0) {
        cy.get(selector).first().scrollIntoView().click({ force: true });
        cy.log('[IM8-TEST] ATC click completed');
        return;
      }
    }
    
    // Fallback - try first selector anyway
    cy.log('[IM8-TEST] No ATC found, trying first selector');
    cy.get(selectors[0], { timeout: 10000 }).first().click({ force: true });
  });
});

// Open cart drawer
Cypress.Commands.add('openCart', () => {
  cy.log('[IM8-TEST] openCart starting...');
  
  const selectors = [
    'button[aria-label*="Cart"]',
    '#cart-icon-bubble',
    'a[href="/cart"]',
    '.cart-icon-bubble'
  ];
  
  cy.get('body').then($body => {
    for (const selector of selectors) {
      const count = $body.find(selector).length;
      console.log(`[IM8-TEST] Cart selector "${selector}" found: ${count}`);
      
      if (count > 0) {
        cy.get(selector).first().click({ force: true });
        cy.log('[IM8-TEST] Cart click completed');
        return;
      }
    }
    
    cy.log('[IM8-TEST] No cart icon found, trying first selector');
    cy.get(selectors[0], { timeout: 10000 }).first().click({ force: true });
  });
});
