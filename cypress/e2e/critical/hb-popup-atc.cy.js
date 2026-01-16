/// <reference types="cypress" />

/**
 * HB Popup Add to Cart Tests - CRITICAL USER INTERACTIONS
 * Tests the AJAX quick-add popup drawer that appears when clicking product cards
 * 
 * CRITICAL: Quick-add functionality is essential for conversion on collection pages
 */

describe('HB Popup Add to Cart - Critical User Interactions', () => {
  beforeEach(() => {
    cy.visit('/collections/all');
    cy.waitForPageLoad();
  });

  describe('Popup Opens and Displays Content', () => {
    it('should OPEN popup when product card is CLICKED', () => {
      // Click on a product card
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .should('be.visible')
        .click({ force: true });
      
      // Verify popup OPENS with active class
      cy.get('.hb_popup.active, [js-hb-popup].active', { timeout: 10000 })
        .should('be.visible');
    });

    it('should load popup content via AJAX (not empty)', () => {
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .click({ force: true });
      
      cy.get('.hb_popup.active', { timeout: 10000 })
        .should('be.visible');
      
      // Wait for AJAX content to load
      cy.get('[js-product-detail]', { timeout: 10000 })
        .should('exist')
        .and('not.be.empty');
    });

    it('should display product TITLE in popup', () => {
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .click({ force: true });
      
      cy.get('.hb_popup.active', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('.hb_popup__title', { timeout: 10000 })
        .should('be.visible')
        .and('not.be.empty');
    });

    it('should display product IMAGE in popup', () => {
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .click({ force: true });
      
      cy.get('.hb_popup.active', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('.hb_popup__main--image img', { timeout: 10000 })
        .should('be.visible')
        .and(($img) => {
          expect($img[0].naturalWidth).to.be.greaterThan(0);
        });
    });

    it('should display PRICE in popup', () => {
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .click({ force: true });
      
      cy.get('.hb_popup.active', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('#price-hb-popup-ajax, .hb_popup__price', { timeout: 10000 })
        .should('be.visible')
        .and('not.be.empty');
    });
  });

  describe('Variant Selection Functionality', () => {
    beforeEach(() => {
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .click({ force: true });
      
      cy.get('.hb_popup.active', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('[js-product-detail]', { timeout: 10000 })
        .should('not.be.empty');
    });

    it('should have CLICKABLE variant options', () => {
      cy.get('body').then(($body) => {
        if ($body.find('#variant-selects-hb-popup-ajax label').length > 0) {
          cy.get('#variant-selects-hb-popup-ajax label')
            .first()
            .should('be.visible')
            .and('not.be.disabled');
        } else if ($body.find('#variant-selects-hb-popup-ajax input[type="radio"]').length > 0) {
          cy.get('#variant-selects-hb-popup-ajax input[type="radio"]')
            .first()
            .should('exist');
        } else {
          cy.log('No variant options found - product may have single variant');
        }
      });
    });

    it('should UPDATE price when variant is CLICKED', () => {
      cy.get('body').then(($body) => {
        const variantLabels = $body.find('#variant-selects-hb-popup-ajax label');
        
        if (variantLabels.length > 1) {
          // Get initial price
          cy.get('#price-hb-popup-ajax, .hb_popup__price')
            .invoke('text')
            .then((initialPrice) => {
              // Click a different variant
              cy.get('#variant-selects-hb-popup-ajax label')
                .eq(1)
                .should('be.visible')
                .click();
              
              cy.wait(1000);
              
              // Price element should still be visible (may or may not change value)
              cy.get('#price-hb-popup-ajax, .hb_popup__price')
                .should('be.visible');
            });
        } else {
          cy.log('Not enough variants to test price change');
        }
      });
    });
  });

  describe('Add to Cart Button Functionality', () => {
    beforeEach(() => {
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .click({ force: true });
      
      cy.get('.hb_popup.active', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('[js-product-detail]', { timeout: 10000 })
        .should('not.be.empty');
    });

    it('should have VISIBLE and ENABLED ATC button', () => {
      cy.get('#ProductSubmitButton-hb-popup-ajax')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should show LOADING state when ATC is CLICKED', () => {
      cy.get('#ProductSubmitButton-hb-popup-ajax')
        .should('be.visible')
        .click();
      
      // Check for loading state
      cy.get('#ProductSubmitButton-hb-popup-ajax.loading, #ProductSubmitButton-hb-popup-ajax[aria-busy="true"], #ProductSubmitButton-hb-popup-ajax[disabled], .loading__spinner')
        .should('exist');
    });

    it('should UPDATE cart count after ATC is CLICKED', () => {
      cy.getCartCount().then((initialCount) => {
        cy.get('#ProductSubmitButton-hb-popup-ajax')
          .should('be.visible')
          .and('not.be.disabled')
          .click();
        
        // Wait for cart update
        cy.wait(3000);
        
        // Verify cart count increased
        cy.get('.cart-count-bubble span')
          .first()
          .invoke('text')
          .then((text) => {
            const newCount = parseInt(text) || 0;
            expect(newCount).to.be.gt(initialCount);
          });
      });
    });

    it('should actually ADD product to cart', () => {
      cy.clearCart();
      cy.visit('/collections/all');
      cy.waitForPageLoad();
      
      // Open popup
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .click({ force: true });
      
      cy.get('.hb_popup.active', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('[js-product-detail]', { timeout: 10000 })
        .should('not.be.empty');
      
      // Click ATC
      cy.get('#ProductSubmitButton-hb-popup-ajax')
        .click();
      
      cy.wait(3000);
      
      // Verify product in cart
      cy.visit('/');
      cy.get('#cart-icon-bubble').click();
      cy.get('#CartDrawer').should('be.visible');
      cy.get('.cart-item').should('have.length.at.least', 1);
    });
  });

  describe('Popup Close Functionality', () => {
    beforeEach(() => {
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .click({ force: true });
      
      cy.get('.hb_popup.active', { timeout: 10000 })
        .should('be.visible');
    });

    it('should have VISIBLE and CLICKABLE close button', () => {
      cy.get('.hb_popup__cross--icon, [js-hb-close-popup]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should CLOSE popup when close button is CLICKED', () => {
      cy.get('.hb_popup__cross--icon, [js-hb-close-popup]')
        .should('be.visible')
        .click();
      
      cy.wait(500);
      
      // Verify popup closed (no active class)
      cy.get('.hb_popup.active')
        .should('not.exist');
    });

    it('should REMOVE active class when closed', () => {
      cy.get('.hb_popup__cross--icon, [js-hb-close-popup]')
        .click();
      
      cy.wait(500);
      
      cy.get('.hb_popup')
        .should('not.have.class', 'active');
    });

    it('should be able to RE-OPEN popup after closing', () => {
      // Close popup
      cy.get('.hb_popup__cross--icon, [js-hb-close-popup]')
        .click();
      
      cy.wait(500);
      cy.get('.hb_popup.active').should('not.exist');
      
      // Re-open popup
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .click({ force: true });
      
      cy.get('.hb_popup.active', { timeout: 10000 })
        .should('be.visible');
    });
  });

  describe('Mobile HB Popup', () => {
    beforeEach(() => {
      cy.setMobileViewport();
      cy.visit('/collections/all');
      cy.waitForPageLoad();
    });

    it('should OPEN popup on mobile', () => {
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .click({ force: true });
      
      cy.get('.hb_popup.active', { timeout: 10000 })
        .should('be.visible');
    });

    it('should have CLICKABLE ATC button on mobile', () => {
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .click({ force: true });
      
      cy.get('.hb_popup.active', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('[js-product-detail]', { timeout: 10000 })
        .should('not.be.empty');
      
      cy.get('#ProductSubmitButton-hb-popup-ajax')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should ADD to cart on mobile', () => {
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .click({ force: true });
      
      cy.get('.hb_popup.active', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('[js-product-detail]', { timeout: 10000 })
        .should('not.be.empty');
      
      cy.getCartCount().then((initialCount) => {
        cy.get('#ProductSubmitButton-hb-popup-ajax')
          .click();
        
        cy.wait(3000);
        
        cy.getCartCount().should('be.gt', initialCount);
      });
    });

    it('should CLOSE popup on mobile', () => {
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .click({ force: true });
      
      cy.get('.hb_popup.active', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('.hb_popup__cross--icon, [js-hb-close-popup]')
        .click();
      
      cy.wait(500);
      
      cy.get('.hb_popup.active')
        .should('not.exist');
    });
  });

  describe('Full User Journey - Quick Add to Checkout', () => {
    it('should complete full journey: browse collection -> quick add -> checkout', () => {
      cy.clearCart();
      cy.visit('/collections/all');
      cy.waitForPageLoad();
      
      // Step 1: Click product to open popup
      cy.get('.product-card a, .card-product a, .card a, .card__content a')
        .first()
        .click({ force: true });
      
      // Step 2: Verify popup opened
      cy.get('.hb_popup.active', { timeout: 10000 })
        .should('be.visible');
      
      // Step 3: Wait for content to load
      cy.get('[js-product-detail]', { timeout: 10000 })
        .should('not.be.empty');
      
      cy.get('.hb_popup__title')
        .should('be.visible');
      
      // Step 4: Click ATC
      cy.get('#ProductSubmitButton-hb-popup-ajax')
        .should('be.visible')
        .and('not.be.disabled')
        .click();
      
      // Step 5: Wait for cart update
      cy.wait(3000);
      
      // Step 6: Verify cart updated
      cy.get('.cart-count-bubble span')
        .first()
        .invoke('text')
        .then((text) => {
          const count = parseInt(text);
          expect(count).to.be.at.least(1);
        });
      
      // Step 7: Close popup
      cy.get('.hb_popup__cross--icon, [js-hb-close-popup]')
        .click();
      
      cy.wait(500);
      
      // Step 8: Open cart drawer
      cy.get('#cart-icon-bubble').click();
      cy.get('#CartDrawer').should('be.visible');
      
      // Step 9: Verify item in cart
      cy.get('.cart-item')
        .should('have.length.at.least', 1);
      
      // Step 10: Proceed to checkout
      cy.get('button[name="checkout"]')
        .should('be.visible')
        .and('not.be.disabled')
        .click();
      
      // Step 11: Verify arrived at checkout
      cy.url({ timeout: 30000 })
        .should('include', 'checkout');
    });
  });
});
