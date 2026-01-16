// Minimal, fast custom commands with detailed logging

// Log helper
const log = (message, data = null) => {
  const logMsg = data ? `[IM8-TEST] ${message}: ${JSON.stringify(data)}` : `[IM8-TEST] ${message}`;
  cy.task('log', logMsg);
  Cypress.log({ name: 'IM8', message: logMsg });
};

// Remove all popups via JavaScript
Cypress.Commands.add('killPopups', () => {
  cy.window().then((win) => {
    const selectors = '[role="dialog"], [aria-modal="true"], [class*="klaviyo"], [class*="popup"], .needsclick';
    const found = win.document.querySelectorAll(selectors);
    log(`killPopups found ${found.length} elements to remove`);
    found.forEach((el, i) => {
      try {
        log(`Removing popup ${i}: ${el.className || el.tagName}`);
        el.remove();
      } catch (e) {
        log(`Failed to remove popup ${i}: ${e.message}`);
      }
    });
  });
});

// Debug page state
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
    log('PAGE STATE', state);
    return state;
  });
});

// Fast page load with debugging
Cypress.Commands.add('fastVisit', (url) => {
  log(`Visiting: ${url}`);
  
  cy.visit(url, { failOnStatusCode: false }).then(() => {
    log('Visit completed, checking body...');
  });
  
  cy.get('body', { timeout: 20000 }).should('exist').then(() => {
    log('Body exists');
  });
  
  // Wait for JS to load
  cy.wait(2000).then(() => {
    log('Wait completed, debugging page state...');
  });
  
  cy.debugPageState();
  cy.killPopups();
  
  // Debug again after killing popups
  cy.debugPageState();
});

// Add to cart with detailed logging
Cypress.Commands.add('forceAddToCart', () => {
  log('forceAddToCart starting...');
  cy.killPopups();
  
  cy.get('body').then($body => {
    const selectors = [
      '[id^="ProductSubmitButton"]',
      '.product-form__submit',
      'button[name="add"]',
      'form[action*="/cart/add"] button[type="submit"]',
      'product-form button[type="submit"]'
    ];
    
    log('Checking ATC selectors...');
    
    for (const selector of selectors) {
      const count = $body.find(selector).length;
      log(`Selector "${selector}" found: ${count}`);
      
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
        log(`Using selector "${selector}"`, info);
        
        cy.get(selector).first().scrollIntoView().click({ force: true }).then(() => {
          log('ATC click completed');
        });
        return;
      }
    }
    
    log('ERROR: No ATC button found with any selector!');
    // Try anyway with first selector
    cy.get(selectors[0], { timeout: 5000 }).first().click({ force: true });
  });
});

// Open cart drawer with logging
Cypress.Commands.add('openCart', () => {
  log('openCart starting...');
  
  cy.get('body').then($body => {
    const selectors = [
      '#cart-icon-bubble',
      'button[aria-label*="Cart"]',
      'a[href="/cart"]',
      '.cart-icon-bubble'
    ];
    
    for (const selector of selectors) {
      const count = $body.find(selector).length;
      log(`Cart selector "${selector}" found: ${count}`);
      
      if (count > 0) {
        cy.get(selector).first().click({ force: true }).then(() => {
          log('Cart click completed');
        });
        return;
      }
    }
    
    log('ERROR: No cart icon found!');
  });
});
