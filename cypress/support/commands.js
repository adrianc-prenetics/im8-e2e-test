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

// Fast page load - does NOT wait for full page load event
// This avoids timeouts from slow third-party scripts (analytics, chat widgets, etc.)
Cypress.Commands.add('fastVisit', (url) => {
  cy.log(`[IM8-TEST] Visiting: ${url}`);
  
  // Use onBeforeLoad to signal we don't need to wait for all resources
  cy.visit(url, {
    failOnStatusCode: false,
    // Don't wait for the full load event - proceed once DOM is interactive
    onBeforeLoad: (win) => {
      // Stub out slow third-party scripts that might block page load
      // This helps prevent timeouts from analytics/tracking scripts
      win.dataLayer = win.dataLayer || [];
      win.ga = win.ga || function() {};
      win.fbq = win.fbq || function() {};
      win.klaviyo = win.klaviyo || [];
    },
    // Use config pageLoadTimeout (30s) - site can be slow
    timeout: 60000,
  });
  
  // Wait for body to exist (DOM ready)
  cy.get('body', { timeout: 30000 }).should('exist');
  
  // Wait for critical page elements to stabilize
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

/**
 * BULLETPROOF: Add to cart with proper button state handling
 * 
 * From product-form.js analysis:
 * - onSubmitHandler checks aria-disabled="true" and returns early if set
 * - Button starts disabled and gets enabled after variant selection
 * - We MUST wait for aria-disabled to NOT be "true" before clicking
 * 
 * This command:
 * 1. Scrolls to product form
 * 2. Waits for button to be enabled (aria-disabled !== "true")
 * 3. Clicks the button
 * 4. Waits for cart drawer to open
 */
Cypress.Commands.add('forceAddToCart', () => {
  cy.log('[IM8-TEST] forceAddToCart starting...');
  cy.killPopups();
  
  // Scroll to product form area first to ensure it's in view
  cy.get('product-form', { timeout: 30000 })
    .first()
    .scrollIntoView();
  
  // Wait for page JS to initialize
  cy.wait(3000);
  cy.killPopups();
  
  // ATC button selector - target the main product form button
  const atcSelector = 'product-form button[type="submit"][name="add"], [id^="ProductSubmitButton"]';
  
  // CRITICAL: Wait for button to be enabled
  // The product-form.js checks aria-disabled="true" and returns early
  // We must wait for this attribute to be removed or set to "false"
  cy.get(atcSelector, { timeout: 30000 })
    .first()
    .should(($btn) => {
      const ariaDisabled = $btn.attr('aria-disabled');
      const isDisabled = $btn.prop('disabled');
      // Button is ready when aria-disabled is not "true" AND not disabled
      const isReady = ariaDisabled !== 'true' && !isDisabled;
      expect(isReady, 'ATC button should be enabled (aria-disabled !== "true")').to.be.true;
    });
  
  cy.log('[IM8-TEST] ATC button is enabled, clicking...');
  cy.killPopups();
  
  // Click the button
  cy.get(atcSelector, { timeout: 5000 })
    .first()
    .click({ force: true });
  
  // Wait for cart drawer to open
  cy.wait(3000);
  
  cy.log('[IM8-TEST] ATC click completed');
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

/**
 * BULLETPROOF: Wait for cart drawer to be open
 * 
 * The cart drawer open sequence (from cart-drawer.js):
 * 1. open() is called
 * 2. 'opening' class is added
 * 3. requestAnimationFrame adds 'animate' + 'active' classes
 * 4. After 50ms, 'opening' is removed
 * 
 * This command checks for ANY of these classes to indicate drawer is open,
 * making it resilient to timing variations.
 */
Cypress.Commands.add('waitForCartDrawerOpen', (options = {}) => {
  const timeout = options.timeout || 15000;
  
  cy.log('[IM8-TEST] waitForCartDrawerOpen starting...');
  
  // First ensure the cart-drawer element exists
  cy.get('cart-drawer', { timeout })
    .should('exist')
    .and(($drawer) => {
      // Check if drawer has any of the "open" state classes
      const hasAnimate = $drawer.hasClass('animate');
      const hasActive = $drawer.hasClass('active');
      const hasOpening = $drawer.hasClass('opening');
      const isOpen = hasAnimate || hasActive || hasOpening;
      expect(isOpen, 'cart drawer should be open (has animate, active, or opening class)').to.be.true;
    });
  
  // Also verify the drawer is visually displayed
  cy.get('cart-drawer')
    .should('have.css', 'display', 'flex');
  
  cy.log('[IM8-TEST] Cart drawer is open');
});

/**
 * BULLETPROOF: Wait for cart drawer content to be ready
 * 
 * After ATC, renderContents() replaces innerHTML and then calls open().
 * This command waits for:
 * 1. Drawer to be open
 * 2. Checkout button to exist (indicates content rendered)
 * 3. Form to be ready (form-button relationship established)
 */
Cypress.Commands.add('waitForCartDrawerReady', (options = {}) => {
  const timeout = options.timeout || 20000;
  
  cy.log('[IM8-TEST] waitForCartDrawerReady starting...');
  
  // Wait for drawer to be open
  cy.waitForCartDrawerOpen({ timeout });
  
  // Wait for checkout button to exist (content rendered)
  const checkoutSelectors = [
    '#CartDrawer-Checkout',
    'button[name="checkout"].cart__checkout-button',
    'cart-drawer button[name="checkout"]'
  ].join(', ');
  
  cy.get(checkoutSelectors, { timeout })
    .should('exist');
  
  // Wait for form to be marked as ready (set by ensureFormReady() in cart-drawer.js)
  cy.get('#CartDrawer-Form', { timeout: 5000 })
    .should('exist');
  
  // Wait for animations to complete (item fade-ins)
  cy.wait(1000);
  
  cy.log('[IM8-TEST] Cart drawer content is ready');
});
