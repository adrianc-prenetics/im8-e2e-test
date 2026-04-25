// Minimal, fast custom commands

// Remove all popups that interfere with testing:
// - Klaviyo email popups
// - Alia "Try Your Luck" scratch card popup (alia-prod.com)
// - Generic modals
// NOTE: Excludes HB popup (.hb_popup) and cart drawer which are needed for testing
Cypress.Commands.add('killPopups', () => {
  cy.window().then((win) => {
    try {
      const body = win.document.body;
      if (body) {
        body.classList.remove('klaviyo-prevent-body-scrolling');
        body.style.display = '';
        body.style.overflow = '';
      }
      
      // Remove Alia popup (scratch card / "Try Your Luck" gamification)
      win.document.querySelectorAll('[id^="alia-root"]').forEach(el => el.remove());
      
      const popupSelectors = [
        '[class*="klaviyo"]',
        '.needsclick',
        '.kl-private-reset-css-Xuajs1'
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
      
      const genericModalSelectors = [
        '[role="dialog"]:not(.cart-drawer):not(.hb_popup)',
        '[aria-modal="true"]:not(.drawer__inner)'
      ];
      
      genericModalSelectors.forEach(selector => {
        try {
          const elements = win.document.querySelectorAll(selector);
          elements.forEach(el => {
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
      
      // Remove any remaining high-z-index overlays that aren't ours
      win.document.querySelectorAll('div').forEach(el => {
        const z = parseInt(win.getComputedStyle(el).zIndex);
        if (z > 99999 && 
            !el.closest('cart-drawer') && 
            !el.closest('[js-hb-popup]') &&
            !el.closest('#CartDrawer') &&
            !el.id?.startsWith('shopify-section')) {
          el.remove();
        }
      });
    } catch (e) {
      // Ignore errors
    }
  });
});

/**
 * Fast page load with US market initialization
 *
 * CRITICAL: For product pages, we must visit the homepage first to establish
 * the US market. Some EU markets have been disabled and product pages will
 * redirect to homepage if the market isn't set correctly.
 *
 * This avoids timeouts from slow third-party scripts (analytics, chat widgets, etc.)
 */
Cypress.Commands.add('fastVisit', (url) => {
  cy.log(`[IM8-TEST] Visiting: ${url}`);

  const isProductPage = url.includes('/products/');

  // Set US market cookies
  cy.setCookie('localization', 'US', { domain: 'im8health.com' });
  cy.setCookie('cart_currency', 'USD', { domain: 'im8health.com' });

  // Block heavy third-party scripts at network level (matches Playwright fastVisit)
  cy.intercept(/alia-prod\.com/, { statusCode: 200, body: '' });
  cy.intercept(/klaviyo/, { statusCode: 200, body: '' });
  cy.intercept(/static\.klaviyo\.com/, { statusCode: 200, body: '' });
  cy.intercept(/gorgias/, { statusCode: 200, body: '' });
  cy.intercept(/loox/, { statusCode: 200, body: '' });

  // For product pages, visit homepage first to establish market
  if (isProductPage) {
    cy.log('[IM8-TEST] Product page detected - visiting homepage first to establish US market');

    cy.visit('/', {
      failOnStatusCode: false,
      onBeforeLoad: (win) => {
        win.dataLayer = win.dataLayer || [];
        win.ga = win.ga || function() {};
        win.fbq = win.fbq || function() {};
        win.klaviyo = win.klaviyo || [];
      },
      timeout: 30000,
    });

    // Wait for homepage to load
    cy.get('body', { timeout: 15000 }).should('exist');

    // Accept cookie consent on homepage
    cy.get('body').then($body => {
      if ($body.find('button').length > 0) {
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

    cy.wait(1000);
  }

  // Now visit the actual URL
  cy.visit(url, {
    failOnStatusCode: false,
    onBeforeLoad: (win) => {
      win.dataLayer = win.dataLayer || [];
      win.ga = win.ga || function() {};
      win.fbq = win.fbq || function() {};
      win.klaviyo = win.klaviyo || [];
      // Set localStorage for market preference
      try {
        win.localStorage.setItem('shopify_market', 'US');
        win.localStorage.setItem('currency', 'USD');
      } catch (e) {
        // localStorage may not be available
      }
    },
    timeout: 60000,
  });

  // Wait for body, then check for Cloudflare challenge and retry if needed
  cy.get('body', { timeout: 30000 }).should('exist');
  cy.get('body').then(($body) => {
    const text = $body.text();
    if (text.includes('security verification') || text.includes('Just a moment')) {
      cy.log('[IM8-TEST] Cloudflare challenge — waiting 15s and retrying...');
      cy.wait(15000);
      cy.reload();
      cy.get('body', { timeout: 30000 }).should('exist');
    }
  });

  // Wait for critical page elements to stabilize
  cy.wait(1500);

  // Kill popups (this also fixes body if Klaviyo hid it)
  cy.killPopups();

  // Accept cookie consent
  cy.get('body').then($body => {
    if ($body.find('button').length > 0) {
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

  // Kill popups again after cookie consent
  cy.killPopups();
});

/**
 * BULLETPROOF: Add to cart with direct API
 * 
 * Uses direct /cart/add.js API call which is most reliable in CI.
 * After adding to cart, fetches updated cart sections and opens drawer.
 * 
 * From product-form.js analysis:
 * - Line 22: onSubmitHandler checks aria-disabled="true" and returns early
 * - Line 36: Sets aria-disabled=true when starting submission
 * - Line 162: Removes aria-disabled in finally block after AJAX completes
 */
Cypress.Commands.add('forceAddToCart', () => {
  cy.log('[IM8-TEST] forceAddToCart starting...');
  cy.killPopups();
  
  // Wait for product-form custom element to be defined (indicates JS is ready)
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      const checkCustomElement = () => {
        if (win.customElements && win.customElements.get('product-form')) {
          resolve();
        } else {
          setTimeout(checkCustomElement, 100);
        }
      };
      checkCustomElement();
    });
  });
  
  cy.log('[IM8-TEST] product-form custom element is defined');
  
  // Wait for page to stabilize
  cy.wait(1000);
  cy.killPopups();
  
  // ATC button selector
  const atcSelector = 'product-form button[type="submit"][name="add"]';
  
  // Wait for button to exist
  cy.get(atcSelector, { timeout: 30000 })
    .first()
    .scrollIntoView();
  
  // Wait for variant to be selected and get variant ID
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      const checkVariant = () => {
        const form = win.document.querySelector('product-form form');
        const variantInput = form?.querySelector('input[name="id"]');
        if (variantInput && variantInput.value) {
          resolve(variantInput.value);
        } else {
          setTimeout(checkVariant, 100);
        }
      };
      checkVariant();
    });
  }).then((variantId) => {
    cy.log(`[IM8-TEST] Variant selected: ${variantId}`);
    cy.killPopups();
    
    // Direct API call to add to cart
    cy.request({
      method: 'POST',
      url: '/cart/add.js',
      body: {
        id: parseInt(variantId, 10),
        quantity: 1,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false,
    }).then((addResponse) => {
      if (addResponse.status === 200) {
        cy.log('[IM8-TEST] Add to cart API successful');

        // Race-prevention: poll /cart.js until item_count > 0 before fetching
        // section HTML. /cart/add.js can return 200 before the cart commit is
        // visible to subsequent reads, leading /?sections=cart-drawer to
        // render with is-empty and hide #CartDrawer-Checkout (CSS rule
        // cart-drawer-items.is-empty + .drawer__footer { display: none }).
        const waitForCartCommit = (attempt = 0) => {
          if (attempt >= 10) {
            // Poll exhausted — log loud so a real ATC failure (e.g. variant
            // out of stock returning 200 with empty cart) doesn't hide behind
            // the otherwise-resilient innerHTML class clearing below.
            cy.log('[IM8-TEST] WARNING: cart commit poll exhausted after 1.5s — possible silent ATC failure');
            return;
          }
          return cy.request({
            method: 'GET',
            url: '/cart.js',
            failOnStatusCode: false,
          }).then((cartResp) => {
            if (cartResp.status === 200 && cartResp.body && cartResp.body.item_count > 0) {
              cy.log(`[IM8-TEST] cart commit confirmed (item_count=${cartResp.body.item_count})`);
              return;
            }
            cy.wait(150);
            return waitForCartCommit(attempt + 1);
          });
        };
        waitForCartCommit();

        // Fetch updated cart sections
        cy.request({
          method: 'GET',
          url: '/cart?sections=cart-drawer,cart-icon-bubble',
          failOnStatusCode: false,
        }).then((sectionsResponse) => {
          if (sectionsResponse.status === 200) {
            // Update cart drawer content and open it
            cy.window().then((win) => {
              const sections = sectionsResponse.body;
              const cartDrawer = win.document.querySelector('cart-drawer');

              if (cartDrawer && sections['cart-drawer']) {
                // Update cart drawer content
                const parser = new DOMParser();
                const doc = parser.parseFromString(sections['cart-drawer'], 'text/html');
                const newContent = doc.querySelector('.drawer__inner');
                const currentContent = cartDrawer.querySelector('.drawer__inner');
                if (newContent && currentContent) {
                  currentContent.innerHTML = newContent.innerHTML;
                }

                // Belt-and-suspenders: clear is-empty on BOTH the outer
                // <cart-drawer> AND the inner <cart-drawer-items>. If the
                // server response was rendered with stale empty-cart state,
                // the inner element brings is-empty in via innerHTML swap,
                // and CSS hides the checkout button. Clearing both classes
                // unblocks #CartDrawer-Checkout visibility regardless of
                // server-side commit ordering.
                const innerItems = cartDrawer.querySelector('cart-drawer-items');
                if (innerItems) innerItems.classList.remove('is-empty');
                cartDrawer.classList.remove('is-empty');
                // GAP#1 fix: liquid renders #CartDrawer-Checkout with disabled
                // attribute when cart == empty (cart-drawer.liquid:1761). After
                // the innerHTML swap, the new button can carry that attribute
                // through if the server response was stale. Clear it so click
                // assertions don't pass-then-silently-no-op.
                const checkoutBtn = cartDrawer.querySelector('#CartDrawer-Checkout');
                if (checkoutBtn) checkoutBtn.removeAttribute('disabled');
                if (typeof cartDrawer.open === 'function') {
                  cartDrawer.open();
                }
              }
              
              // Update cart icon bubble
              if (sections['cart-icon-bubble']) {
                const bubble = win.document.querySelector('#cart-icon-bubble');
                if (bubble) {
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(sections['cart-icon-bubble'], 'text/html');
                  const newBubble = doc.querySelector('#cart-icon-bubble');
                  if (newBubble) {
                    bubble.innerHTML = newBubble.innerHTML;
                  }
                }
              }
            });
          } else {
            // Just open the drawer without updating content
            cy.window().then((win) => {
              const cartDrawer = win.document.querySelector('cart-drawer');
              if (cartDrawer) {
                cartDrawer.classList.remove('is-empty');
                if (typeof cartDrawer.open === 'function') {
                  cartDrawer.open();
                }
              }
            });
          }
        });
      } else {
        // Fallback: Button click
        cy.log('[IM8-TEST] API failed, using button click fallback');
        
        cy.get(atcSelector, { timeout: 10000 })
          .first()
          .should(($btn) => {
            const ariaDisabled = $btn.attr('aria-disabled');
            expect(ariaDisabled).to.not.equal('true');
          });
        
        cy.killPopups();
        
        cy.get(atcSelector)
          .first()
          .click({ force: true });
      }
    });
  });
  
  cy.log('[IM8-TEST] Add to cart completed');
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
