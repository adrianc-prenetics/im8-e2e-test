// Minimal, fast custom commands

// Remove all popups via JavaScript - using only valid native selectors
// NOTE: Excludes HB popup (.hb_popup) and cart drawer which are needed for testing
Cypress.Commands.add('killPopups', () => {
  cy.window().then((win) => {
    try {
      // CRITICAL: Fix body if Klaviyo has hidden it
      // Klaviyo adds 'klaviyo-prevent-body-scrolling' class which sets display:none
      const body = win.document.body;
      if (body) {
        body.classList.remove('klaviyo-prevent-body-scrolling');
        body.style.display = '';
        body.style.overflow = '';
      }
      
      const popupSelectors = [
        '[class*="klaviyo"]',
        '.needsclick',
        '.kl-private-reset-css-Xuajs1' // Klaviyo specific class
      ];
      
      popupSelectors.forEach(selector => {
        try {
          const elements = win.document.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
          });
        } catch (e) {
          // Ignore selector errors
        }
      });
      
      // Hide generic modals but NOT the HB popup or cart drawer
      // These are needed for e2e testing
      const genericModalSelectors = [
        '[role="dialog"]:not(.cart-drawer):not(.hb_popup)',
        '[aria-modal="true"]:not(.drawer__inner)'
      ];
      
      genericModalSelectors.forEach(selector => {
        try {
          const elements = win.document.querySelectorAll(selector);
          elements.forEach(el => {
            // Skip if it's part of cart drawer or HB popup
            if (el.closest('.cart-drawer') || el.closest('.hb_popup') || el.closest('[js-hb-popup]')) {
              return;
            }
            el.style.display = 'none';
            el.style.visibility = 'hidden';
          });
        } catch (e) {
          // Ignore selector errors
        }
      });
    } catch (e) {
      // Ignore errors
    }
  });
});

// Fast page load - simplified
Cypress.Commands.add('fastVisit', (url) => {
  cy.log(`[IM8-TEST] Visiting: ${url}`);
  
  cy.visit(url, { failOnStatusCode: false });
  
  // Wait for body to exist
  cy.get('body', { timeout: 30000 }).should('exist');
  
  // Wait for page to stabilize
  cy.wait(1500);
  
  // Kill popups (this also fixes body if Klaviyo hid it)
  cy.killPopups();
  
  // Accept cookie consent - use Cypress .contains() which is the proper way
  cy.get('body').then($body => {
    if ($body.find('button').length > 0) {
      // Use Cypress contains to find and click accept button
      cy.get('button').then($buttons => {
        const acceptBtn = $buttons.filter((i, el) => {
          return el.textContent.toLowerCase().includes('accept');
        });
        if (acceptBtn.length > 0) {
          cy.wrap(acceptBtn.first()).click({ force: true });
        }
      });
    }
  });
  
  // Kill popups again after cookie consent in case new ones appeared
  cy.killPopups();
});

// Add to cart with force click
Cypress.Commands.add('forceAddToCart', () => {
  cy.log('[IM8-TEST] forceAddToCart starting...');
  cy.killPopups();
  
  // Combined selector - wait for ANY of these to appear (Cypress will retry)
  // Based on shopify-im8-ui/snippets/buy-buttons.liquid:
  // - id="ProductSubmitButton-{{ section_id }}" 
  // - class="product-form__submit"
  // - name="add"
  const combinedSelector = [
    '[id^="ProductSubmitButton"]',
    '.product-form__submit',
    'button[name="add"]',
    'form[action*="/cart/add"] button[type="submit"]',
    'product-form button[type="submit"]'
  ].join(', ');
  
  // Use Cypress retry-ability - wait for any matching element
  cy.get(combinedSelector, { timeout: 15000 })
    .first()
    .scrollIntoView()
    .click({ force: true });
});

// Open cart drawer
Cypress.Commands.add('openCart', () => {
  cy.log('[IM8-TEST] openCart starting...');
  cy.killPopups(); // Ensure body is visible before trying to click
  
  const selectors = [
    '#cart-icon-bubble', // Primary selector from theme
    'button[aria-label*="Cart"]',
    'a[href="/cart"]',
    '.cart-icon-bubble'
  ];
  
  cy.get('body').then($body => {
    for (const selector of selectors) {
      if ($body.find(selector).length > 0) {
        cy.get(selector).first().click({ force: true });
        return;
      }
    }
    cy.get(selectors[0], { timeout: 10000 }).first().click({ force: true });
  });
});
