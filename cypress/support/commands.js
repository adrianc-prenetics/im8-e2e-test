// ***********************************************
// Custom Cypress Commands for im8store E2E Tests
// ***********************************************

// ==========================================
// VIEWPORT COMMANDS
// ==========================================

/**
 * Set viewport to mobile dimensions
 */
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 812);
});

/**
 * Set viewport to tablet dimensions
 */
Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024);
});

/**
 * Set viewport to desktop dimensions
 */
Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720);
});

// ==========================================
// MOBILE NAVIGATION COMMANDS
// ==========================================

/**
 * Open mobile navigation drawer
 */
Cypress.Commands.add('openMobileNav', () => {
  cy.get('header-drawer summary.header__icon--menu')
    .should('be.visible')
    .click();
  cy.get('#menu-drawer')
    .should('be.visible');
});

/**
 * Close mobile navigation drawer
 */
Cypress.Commands.add('closeMobileNav', () => {
  cy.get('.menu-drawer__close-button')
    .should('be.visible')
    .click();
  cy.get('#menu-drawer')
    .should('not.be.visible');
});

/**
 * Navigate to a menu item in mobile nav
 * @param {string} menuText - Text of the menu item to click
 */
Cypress.Commands.add('clickMobileMenuItem', (menuText) => {
  cy.get('.menu-drawer__menu-item')
    .contains(menuText)
    .should('be.visible')
    .click();
});

/**
 * Expand a submenu in mobile nav
 * @param {string} menuText - Text of the parent menu item
 */
Cypress.Commands.add('expandMobileSubmenu', (menuText) => {
  cy.get('.menu-drawer__menu-item')
    .contains(menuText)
    .closest('details')
    .click();
  cy.get('.menu-drawer__submenu')
    .should('be.visible');
});

// ==========================================
// CART DRAWER COMMANDS
// ==========================================

/**
 * Open cart drawer
 */
Cypress.Commands.add('openCartDrawer', () => {
  cy.get('#cart-icon-bubble')
    .should('be.visible')
    .click();
  cy.get('cart-drawer')
    .should('exist');
  cy.get('#CartDrawer')
    .should('be.visible');
});

/**
 * Close cart drawer
 */
Cypress.Commands.add('closeCartDrawer', () => {
  cy.get('.drawer__close')
    .should('be.visible')
    .click();
  // Wait for drawer to close
  cy.wait(500);
});

/**
 * Get cart count from bubble
 * @returns {Cypress.Chainable<number>}
 */
Cypress.Commands.add('getCartCount', () => {
  return cy.get('body').then(($body) => {
    if ($body.find('.cart-count-bubble span').length > 0) {
      return cy.get('.cart-count-bubble span')
        .first()
        .invoke('text')
        .then((text) => parseInt(text) || 0);
    }
    return cy.wrap(0);
  });
});

/**
 * Verify cart is empty
 */
Cypress.Commands.add('verifyCartEmpty', () => {
  cy.openCartDrawer();
  cy.get('body').then(($body) => {
    // Check for either empty state selector
    const hasEmptyText = $body.find('.cart__empty-text').length > 0;
    const hasEmptyContent = $body.find('.cart-drawer__empty-content').length > 0;
    expect(hasEmptyText || hasEmptyContent).to.be.true;
  });
});

/**
 * Clear all items from cart
 */
Cypress.Commands.add('clearCart', () => {
  cy.visit('/cart');
  cy.get('body').then(($body) => {
    if ($body.find('.cart-item').length > 0) {
      // Remove all items
      cy.get('.cart-item').each(() => {
        cy.get('.cart-item')
          .first()
          .find('cart-remove-button a, .cart-remove-button, [href*="change?"]')
          .first()
          .click({ force: true });
        cy.wait(1000);
      });
    }
  });
});

/**
 * Update quantity in cart drawer
 * @param {number} quantity - New quantity value
 */
Cypress.Commands.add('updateCartQuantity', (quantity) => {
  cy.get('quantity-input input')
    .clear()
    .type(quantity.toString())
    .blur();
  cy.wait(1000); // Wait for cart update
});

// ==========================================
// ADD TO CART COMMANDS
// ==========================================

/**
 * Add product to cart from product page
 * Scrolls to the main ATC button to avoid sticky bar coverage
 */
Cypress.Commands.add('addToCart', () => {
  // Scroll to product form area to ensure main ATC button is visible
  // (not covered by sticky ATC bar)
  cy.get('body').then(($body) => {
    if ($body.find('.product-form, .product__info-wrapper, .product__info-container').length > 0) {
      cy.get('.product-form, .product__info-wrapper, .product__info-container').first()
        .scrollIntoView({ offset: { top: -200, left: 0 } });
      cy.wait(500);
    }
  });
  
  // Try multiple selectors for the add to cart button
  cy.get('body').then(($body) => {
    if ($body.find('.product-form__submit').length > 0) {
      cy.get('.product-form__submit').first()
        .should('be.visible')
        .should('not.be.disabled')
        .click();
    } else if ($body.find('button[name="add"]').length > 0) {
      cy.get('button[name="add"]').first()
        .should('be.visible')
        .should('not.be.disabled')
        .click();
    }
  });
  // Wait for cart to update
  cy.wait(1500);
});

/**
 * Add product to cart and verify
 */
Cypress.Commands.add('addToCartAndVerify', () => {
  cy.getCartCount().then((initialCount) => {
    cy.addToCart();
    cy.getCartCount().should('be.gt', initialCount);
  });
});

/**
 * Visit product page
 * @param {string} handle - Product handle/slug
 */
Cypress.Commands.add('visitProduct', (handle) => {
  cy.visit(`/products/${handle}`);
  cy.get('.product-form__submit, button[name="add"]')
    .should('exist');
});

/**
 * Scroll to main ATC button (avoiding sticky ATC bar coverage)
 */
Cypress.Commands.add('scrollToMainAtcButton', () => {
  cy.get('.product-form, .product__info-wrapper, .product__info-container').first()
    .scrollIntoView({ offset: { top: -200, left: 0 } });
  cy.wait(500);
});

// ==========================================
// HB POPUP COMMANDS
// ==========================================

/**
 * Open HB popup by clicking a product card
 * @param {number} index - Index of the product card to click (0-based)
 */
Cypress.Commands.add('openHbPopup', (index = 0) => {
  // Look for product cards that trigger the HB popup
  cy.get('body').then(($body) => {
    // Try different selectors for quick-add triggers
    const selectors = [
      '.product-card__quick-add',
      '[data-quick-add]',
      '.quick-add-button',
      '.card-product a',
      '.product-card a',
      '.card__content a'
    ];
    
    let found = false;
    for (const selector of selectors) {
      if ($body.find(selector).length > 0 && !found) {
        cy.get(selector)
          .eq(index)
          .click({ force: true });
        found = true;
        break;
      }
    }
    
    if (!found) {
      // Fallback: click on product image/link
      cy.get('.product-card, .card-product, .card')
        .eq(index)
        .find('a')
        .first()
        .click({ force: true });
    }
  });
  
  // Wait for popup to appear
  cy.get('.hb_popup.active, [js-hb-popup].active', { timeout: 10000 })
    .should('be.visible');
});

/**
 * Close HB popup
 */
Cypress.Commands.add('closeHbPopup', () => {
  cy.get('.hb_popup__cross--icon, [js-hb-close-popup]')
    .should('be.visible')
    .click();
  // Verify popup is closed
  cy.get('.hb_popup.active')
    .should('not.exist');
});

/**
 * Add to cart from HB popup
 */
Cypress.Commands.add('addToCartFromHbPopup', () => {
  cy.get('#ProductSubmitButton-hb-popup-ajax')
    .should('be.visible')
    .should('not.be.disabled')
    .click();
  // Wait for loading state and cart update
  cy.wait(2000);
});

/**
 * Select variant in HB popup
 * @param {number} index - Index of the variant to select (0-based)
 */
Cypress.Commands.add('selectHbPopupVariant', (index = 0) => {
  cy.get('#variant-selects-hb-popup-ajax label')
    .eq(index)
    .click();
  cy.wait(500); // Wait for price update
});

/**
 * Update quantity in HB popup
 * @param {number} quantity - New quantity value
 */
Cypress.Commands.add('updateHbPopupQuantity', (quantity) => {
  cy.get('#Quantity-hb-popup-ajax')
    .clear()
    .type(quantity.toString());
});

// ==========================================
// HEADER NAVIGATION COMMANDS
// ==========================================

/**
 * Click on logo to go home
 */
Cypress.Commands.add('clickLogo', () => {
  cy.get('.header__heading-logo')
    .should('be.visible')
    .click();
  cy.url().should('eq', Cypress.config('baseUrl') + '/');
});

/**
 * Hover over mega menu item
 * @param {string} menuText - Text of the menu item to hover
 */
Cypress.Commands.add('hoverMegaMenu', (menuText) => {
  cy.get('.header__inline-menu, .header_left_new')
    .contains(menuText)
    .trigger('mouseenter');
  cy.get('.mega-menu')
    .should('be.visible');
});

/**
 * Click desktop menu item
 * @param {string} menuText - Text of the menu item to click
 */
Cypress.Commands.add('clickDesktopMenuItem', (menuText) => {
  cy.get('.header__inline-menu, .header_left_new')
    .contains(menuText)
    .click();
});

// ==========================================
// CHECKOUT COMMANDS
// ==========================================

/**
 * Proceed to checkout from cart drawer
 */
Cypress.Commands.add('proceedToCheckoutFromDrawer', () => {
  cy.openCartDrawer();
  cy.get('button[name="checkout"]')
    .should('be.visible')
    .click();
  // Verify navigation to checkout
  cy.url({ timeout: 30000 })
    .should('include', 'checkout');
});

/**
 * Proceed to checkout from cart page
 */
Cypress.Commands.add('proceedToCheckoutFromCart', () => {
  cy.visit('/cart');
  cy.get('button[name="checkout"], [name="checkout"]')
    .should('be.visible')
    .click();
  // Verify navigation to checkout
  cy.url({ timeout: 30000 })
    .should('include', 'checkout');
});

// ==========================================
// UTILITY COMMANDS
// ==========================================

/**
 * Dismiss any marketing popups (Klaviyo, etc.) that may block interactions
 * This is critical for CI environments where popups can cover the entire page
 */
Cypress.Commands.add('dismissPopups', () => {
  cy.get('body').then(($body) => {
    // Klaviyo popup - look for the close button or overlay
    const klaviyoSelectors = [
      // Close button selectors
      '[aria-label="Close dialog"]',
      '[aria-label="Close form"]',
      '.klaviyo-close-form',
      '.kl-private-reset-css-Xuajs1 button[aria-label*="close" i]',
      '.kl-private-reset-css-Xuajs1 button[aria-label*="Close" i]',
      '.needsclick [aria-label*="close" i]',
      // Generic close buttons in popups
      '[role="dialog"] button[aria-label*="close" i]',
      '[role="dialog"] button[aria-label*="Close" i]',
      '[role="dialog"] .close',
      '[role="dialog"] [class*="close"]',
    ];
    
    for (const selector of klaviyoSelectors) {
      if ($body.find(selector).length > 0) {
        cy.get(selector).first().click({ force: true });
        cy.wait(500);
        return;
      }
    }
    
    // If no close button found, try clicking outside the popup (on overlay)
    const overlaySelectors = [
      '.kl-private-reset-css-Xuajs1',
      '[role="dialog"][aria-modal="true"]',
    ];
    
    for (const selector of overlaySelectors) {
      const $overlay = $body.find(selector);
      if ($overlay.length > 0) {
        // Try pressing Escape key to close
        cy.get('body').type('{esc}');
        cy.wait(500);
        return;
      }
    }
  });
});

/**
 * Force remove any blocking popups by hiding them via JavaScript
 * This handles Klaviyo popups, cookie banners, and other marketing overlays
 */
Cypress.Commands.add('forceRemovePopups', () => {
  cy.window().then((win) => {
    // Hide Klaviyo popups and any modal dialogs
    const popupSelectors = [
      '[role="dialog"][aria-modal="true"]',
      '.kl-private-reset-css-Xuajs1',
      '.klaviyo-form',
      '[class*="klaviyo"]',
      '[id*="klaviyo"]',
    ];
    
    popupSelectors.forEach((selector) => {
      const elements = win.document.querySelectorAll(selector);
      elements.forEach((el) => {
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      });
    });
    
    // Remove any high z-index overlays that might be blocking interactions
    const allElements = win.document.querySelectorAll('*');
    allElements.forEach((el) => {
      const style = win.getComputedStyle(el);
      const zIndex = parseInt(style.zIndex);
      // If element has very high z-index and is fixed/absolute positioned, it might be a popup
      if (zIndex > 9000 && (style.position === 'fixed' || style.position === 'absolute')) {
        const isPopup = el.getAttribute('role') === 'dialog' || 
                       el.classList.contains('needsclick') ||
                       el.getAttribute('aria-modal') === 'true';
        if (isPopup) {
          el.style.display = 'none';
        }
      }
    });
  });
});

/**
 * Wait for page to fully load and dismiss any popups/banners
 */
Cypress.Commands.add('waitForPageLoad', () => {
  cy.document().its('readyState').should('eq', 'complete');
  cy.wait(1500);
  
  // Dismiss cookie consent banner if present
  cy.get('body').then(($body) => {
    // Cookie consent banner
    if ($body.find('button:contains("Accept")').length > 0) {
      cy.contains('button', 'Accept').click({ force: true });
      cy.wait(300);
    }
  });
  
  // Force remove any blocking popups (Klaviyo, etc.)
  cy.forceRemovePopups();
});

/**
 * Check for broken images on page
 */
Cypress.Commands.add('checkBrokenImages', () => {
  cy.get('img').each(($img) => {
    // Skip lazy-loaded images that haven't loaded yet
    if ($img.attr('loading') === 'lazy' && !$img.attr('src')) {
      return;
    }
    
    cy.wrap($img)
      .should('be.visible')
      .and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
  });
});

/**
 * Verify internal links are valid
 */
Cypress.Commands.add('checkInternalLinks', () => {
  cy.get('a[href^="/"]').each(($link) => {
    const href = $link.attr('href');
    if (href && href !== '#' && !href.includes('javascript:')) {
      cy.request({
        url: href,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.lessThan(400);
      });
    }
  });
});

/**
 * Scroll to element and verify visibility
 * @param {string} selector - CSS selector of element
 */
Cypress.Commands.add('scrollToAndVerify', (selector) => {
  cy.get(selector)
    .scrollIntoView()
    .should('be.visible');
});

/**
 * Take a named screenshot
 * @param {string} name - Name for the screenshot
 */
Cypress.Commands.add('takeNamedScreenshot', (name) => {
  cy.screenshot(name, { capture: 'viewport' });
});
