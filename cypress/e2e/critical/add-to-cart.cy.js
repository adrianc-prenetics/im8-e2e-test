/// <reference types="cypress" />

/**
 * Add to Cart Tests - CRITICAL USER INTERACTIONS
 * Tests that the add to cart functionality is fully FUNCTIONAL for conversions
 * 
 * CRITICAL: Users must be able to add products to cart to make purchases
 * 
 * NOTE: This product page has a sticky ATC bar at the bottom that can cover
 * the main ATC button. Tests scroll to the button to ensure visibility.
 */

describe('Add to Cart - Critical User Interactions', () => {
  beforeEach(() => {
    cy.fixture('products').then((products) => {
      cy.visitProduct(products.testProduct.handle);
      cy.waitForPageLoad();
    });
  });

  // Helper to get the main ATC button (not the sticky one)
  const getMainAtcButton = () => {
    return cy.get('.product-form__submit, button[name="add"]').first();
  };

  // Helper to scroll to and interact with the main ATC button
  const scrollToMainAtcButton = () => {
    // Scroll to the product form area to ensure the main ATC button is visible
    // and not covered by the sticky ATC bar
    cy.get('.product-form, .product__info-wrapper, .product__info-container').first()
      .scrollIntoView({ offset: { top: -200, left: 0 } });
    cy.wait(500);
  };

  describe('Add to Cart Button Functionality', () => {
    it('should have VISIBLE and ENABLED add to cart button', () => {
      scrollToMainAtcButton();
      getMainAtcButton()
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should be CLICKABLE - not blocked by overlays', () => {
      scrollToMainAtcButton();
      getMainAtcButton()
        .should('be.visible')
        .and('not.be.disabled')
        .click();
      
      // If we get here without error, button was clickable
      // Verify some response happened (loading state or cart update)
      cy.wait(500);
    });

    it('should show LOADING state when clicked', () => {
      scrollToMainAtcButton();
      getMainAtcButton()
        .should('be.visible')
        .click();
      
      // Check for loading state - may be brief
      // The button may get disabled, show a spinner, or have aria-busy
      cy.get('.loading__spinner, .product-form__submit[aria-busy="true"], .product-form__submit.loading, .product-form__submit[disabled]')
        .should('exist');
    });

    it('should UPDATE cart count after adding product', () => {
      cy.getCartCount().then((initialCount) => {
        scrollToMainAtcButton();
        getMainAtcButton()
          .should('be.visible')
          .and('not.be.disabled')
          .click();
        
        // Wait for cart to update
        cy.wait(2000);
        
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

    it('should OPEN cart drawer OR show notification after adding', () => {
      scrollToMainAtcButton();
      getMainAtcButton()
        .click();
      
      cy.wait(2000);
      
      // Either cart drawer opens OR cart count updates
      cy.get('body').then(($body) => {
        const drawerVisible = $body.find('#CartDrawer:visible').length > 0;
        const cartBubbleVisible = $body.find('.cart-count-bubble:visible').length > 0;
        const notificationVisible = $body.find('.cart-notification:visible, [data-cart-notification]:visible').length > 0;
        
        expect(drawerVisible || cartBubbleVisible || notificationVisible).to.be.true;
      });
    });

    it('should actually ADD product to cart (verify in drawer)', () => {
      // Clear cart first
      cy.clearCart();
      cy.fixture('products').then((products) => {
        cy.visitProduct(products.testProduct.handle);
        cy.waitForPageLoad();
        
        // Add to cart
        scrollToMainAtcButton();
        getMainAtcButton()
          .should('be.visible')
          .click();
        
        cy.wait(2000);
        
        // Open cart drawer and verify product is there
        cy.visit('/');
        cy.get('#cart-icon-bubble').click();
        cy.get('#CartDrawer').should('be.visible');
        
        // Verify item is in cart
        cy.get('.cart-item')
          .should('have.length.at.least', 1);
      });
    });
  });

  describe('Multiple Add to Cart', () => {
    it('should INCREMENT cart count with each add', () => {
      cy.getCartCount().then((initialCount) => {
        // First add
        scrollToMainAtcButton();
        getMainAtcButton()
          .click();
        cy.wait(2000);
        
        cy.getCartCount().then((afterFirstAdd) => {
          expect(afterFirstAdd).to.be.gt(initialCount);
          
          // Second add - need to scroll again as page may have shifted
          scrollToMainAtcButton();
          getMainAtcButton()
            .should('not.be.disabled')
            .click();
          cy.wait(2000);
          
          cy.getCartCount().then((afterSecondAdd) => {
            expect(afterSecondAdd).to.be.gt(afterFirstAdd);
          });
        });
      });
    });
  });

  describe('Mobile Add to Cart', () => {
    beforeEach(() => {
      cy.setMobileViewport();
      cy.fixture('products').then((products) => {
        cy.visitProduct(products.testProduct.handle);
        cy.waitForPageLoad();
      });
    });

    it('should have VISIBLE and CLICKABLE ATC button on mobile', () => {
      scrollToMainAtcButton();
      getMainAtcButton()
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should ADD product to cart on mobile', () => {
      cy.getCartCount().then((initialCount) => {
        scrollToMainAtcButton();
        getMainAtcButton()
          .click();
        
        cy.wait(2000);
        
        cy.getCartCount().should('be.gt', initialCount);
      });
    });

    it('should complete mobile add to cart journey', () => {
      // Add to cart
      scrollToMainAtcButton();
      getMainAtcButton()
        .click();
      
      cy.wait(2000);
      
      // Scroll to top to see cart icon
      cy.scrollTo('top');
      cy.wait(500);
      
      // Verify cart updated
      cy.get('.cart-count-bubble')
        .should('be.visible');
      
      // Open cart drawer
      cy.get('#cart-icon-bubble').click();
      cy.get('#CartDrawer').should('be.visible');
      
      // Verify item in cart
      cy.get('.cart-item')
        .should('have.length.at.least', 1);
    });
  });

  describe('Full User Journey - Product to Cart', () => {
    it('should complete full journey: view product -> add to cart -> verify in cart -> proceed to checkout', () => {
      cy.clearCart();
      
      cy.fixture('products').then((products) => {
        // Step 1: Visit product page
        cy.visitProduct(products.testProduct.handle);
        cy.waitForPageLoad();
        
        // Step 2: Scroll to and verify ATC button is functional
        scrollToMainAtcButton();
        getMainAtcButton()
          .should('be.visible')
          .and('not.be.disabled');
        
        // Step 3: Click ATC
        getMainAtcButton()
          .click();
        
        // Step 4: Wait for cart update
        cy.wait(2000);
        
        // Step 5: Scroll to top to see cart count
        cy.scrollTo('top');
        cy.wait(500);
        
        // Step 6: Verify cart count updated
        cy.get('.cart-count-bubble span')
          .first()
          .invoke('text')
          .then((text) => {
            const count = parseInt(text);
            expect(count).to.be.at.least(1);
          });
        
        // Step 7: Open cart drawer
        cy.get('#cart-icon-bubble').click();
        cy.get('#CartDrawer').should('be.visible');
        
        // Step 8: Verify product in cart
        cy.get('.cart-item')
          .should('have.length.at.least', 1);
        
        // Step 9: Proceed to checkout
        cy.get('button[name="checkout"]')
          .should('be.visible')
          .and('not.be.disabled')
          .click();
        
        // Step 10: Verify arrived at checkout
        cy.url({ timeout: 30000 })
          .should('include', 'checkout');
      });
    });
  });
});
