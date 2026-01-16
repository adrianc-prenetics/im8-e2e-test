// Minimal, fast custom commands with detailed logging

// Remove all popups via JavaScript
Cypress.Commands.add('killPopups', () => {
  cy.window().then((win) => {
    const selectors = '[role="dialog"], [aria-modal="true"], [class*="klaviyo"], [class*="popup"], .needsclick';
    const found = win.document.querySelectorAll(selectors);
    cy.task('log', `[IM8-TEST] killPopups found ${found.length} elements to remove`);
    found.forEach((el, i) => {
      try {
        cy.task('log', `[IM8-TEST] Removing popup ${i}: ${el.className || el.tagName}`);
        el.remove();
      } catch (e) {
        cy.task('log', `[IM8-TEST] Failed to remove popup ${i}: ${e.message}`);
      }
    });
  });
});

// Debug page state - logs everything, returns nothing
Cypress.Commands.add('debugPageState', () => {
  cy.window().then((win) => {
    const doc = win.document;
    const state = {
      url: win.location.href,
      title: doc.title,
      bodyExists: !!doc.body,
      bodyClasses: doc.body?.className || 'NO BODY',
      hasPasswordForm: !!doc.querySelector('form[action*="password"]'),
      hasProductForm: !!doc.querySelector('product-form'),
      hasHeader: !!doc.querySelector('header'),
      atcButtonSelectors: {
        'ProductSubmitButton': doc.querySelectorAll('[id^="ProductSubmitButton"]').length,
        'product-form__submit': doc.querySelectorAll('.product-form__submit').length,
        'button[name=add]': doc.querySelectorAll('button[name="add"]').length,
        'product-form button': doc.querySelectorAll('product-form button').length,
      },
      cartIconSelectors: {
        'cart-icon-bubble': doc.querySelectorAll('#cart-icon-bubble').length,
        'button[aria-label*=Cart]': doc.querySelectorAll('button[aria-label*="Cart"]').length,
        'a[href=/cart]': doc.querySelectorAll('a[href="/cart"]').length,
      },
      popupsPresent: {
        'role=dialog': doc.querySelectorAll('[role="dialog"]').length,
        'aria-modal': doc.querySelectorAll('[aria-modal="true"]').length,
        'klaviyo': doc.querySelectorAll('[class*="klaviyo"]').length,
      },
      visibleDialogs: Array.from(doc.querySelectorAll('[role="dialog"]')).map(d => ({
        visible: d.offsetParent !== null,
        classes: d.className.substring(0, 100)
      }))
    };
    // Log the state - don't return it
    cy.task('log', '[IM8-TEST] PAGE STATE: ' + JSON.stringify(state, null, 2));
  });
});

// Fast page load with debugging
Cypress.Commands.add('fastVisit', (url) => {
  cy.task('log', `[IM8-TEST] Visiting: ${url}`);
  
  cy.visit(url, { failOnStatusCode: false });
  cy.task('log', '[IM8-TEST] Visit completed, checking body...');
  
  cy.get('body', { timeout: 20000 }).should('exist');
  cy.task('log', '[IM8-TEST] Body exists');
  
  // Wait for JS to load
  cy.wait(2000);
  cy.task('log', '[IM8-TEST] Wait completed, debugging page state...');
  
  cy.debugPageState();
  cy.killPopups();
  
  // Debug again after killing popups
  cy.task('log', '[IM8-TEST] After killPopups:');
  cy.debugPageState();
});

// Add to cart with detailed logging
Cypress.Commands.add('forceAddToCart', () => {
  cy.task('log', '[IM8-TEST] forceAddToCart starting...');
  cy.killPopups();
  
  cy.get('body').then($body => {
    const selectors = [
      '[id^="ProductSubmitButton"]',
      '.product-form__submit',
      'button[name="add"]',
      'form[action*="/cart/add"] button[type="submit"]',
      'product-form button[type="submit"]'
    ];
    
    cy.task('log', '[IM8-TEST] Checking ATC selectors...');
    
    for (const selector of selectors) {
      const count = $body.find(selector).length;
      cy.task('log', `[IM8-TEST] Selector "${selector}" found: ${count}`);
      
      if (count > 0) {
        const el = $body.find(selector).first();
        const info = {
          id: el.attr('id'),
          name: el.attr('name'),
          class: el.attr('class')?.substring(0, 50),
          visible: el.is(':visible'),
          disabled: el.is(':disabled'),
          text: el.text().substring(0, 30)
        };
        cy.task('log', `[IM8-TEST] Using selector "${selector}": ${JSON.stringify(info)}`);
        
        cy.get(selector).first().scrollIntoView().click({ force: true });
        cy.task('log', '[IM8-TEST] ATC click completed');
        return;
      }
    }
    
    cy.task('log', '[IM8-TEST] ERROR: No ATC button found with any selector!');
    // Try anyway with first selector
    cy.get(selectors[0], { timeout: 5000 }).first().click({ force: true });
  });
});

// Open cart drawer with logging
Cypress.Commands.add('openCart', () => {
  cy.task('log', '[IM8-TEST] openCart starting...');
  
  cy.get('body').then($body => {
    const selectors = [
      '#cart-icon-bubble',
      'button[aria-label*="Cart"]',
      'a[href="/cart"]',
      '.cart-icon-bubble'
    ];
    
    for (const selector of selectors) {
      const count = $body.find(selector).length;
      cy.task('log', `[IM8-TEST] Cart selector "${selector}" found: ${count}`);
      
      if (count > 0) {
        cy.get(selector).first().click({ force: true });
        cy.task('log', '[IM8-TEST] Cart click completed');
        return;
      }
    }
    
    cy.task('log', '[IM8-TEST] ERROR: No cart icon found!');
  });
});
