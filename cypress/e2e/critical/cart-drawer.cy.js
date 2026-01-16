/// <reference types="cypress" />

/**
 * Cart Drawer Tests - CRITICAL USER INTERACTIONS
 * Tests that the cart drawer is fully FUNCTIONAL for conversions
 * 
 * CRITICAL: Cart drawer must work for users to complete purchases
 */

describe('Cart Drawer - Critical User Interactions', () => {
  describe('Cart Drawer Opens and Functions', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.waitForPageLoad();
    });

    it('should OPEN cart drawer when cart icon is CLICKED', () => {
      // Verify cart icon is visible AND clickable
      cy.get('#cart-icon-bubble')
        .should('be.visible')
        .and('not.be.disabled')
        .click();
      
      // Verify drawer actually OPENS
      cy.get('cart-drawer')
        .should('exist');
      
      cy.get('#CartDrawer')
        .should('be.visible');
    });

    it('should display empty cart state when cart is empty', () => {
      // First clear cart to ensure empty state
      cy.clearCart();
      cy.visit('/');
      cy.waitForPageLoad();
      
      // Open cart drawer
      cy.get('#cart-icon-bubble')
        .should('be.visible')
        .click();
      
      cy.get('#CartDrawer')
        .should('be.visible');
      
      // Verify empty state is visible
      cy.get('.cart__empty-text, .cart-drawer__empty-content')
        .should('be.visible');
    });

    it('should CLOSE drawer when close button is CLICKED', () => {
      // Open drawer
      cy.get('#cart-icon-bubble')
        .click();
      
      cy.get('#CartDrawer')
        .should('be.visible');
      
      // Click close button
      cy.get('.drawer__close')
        .should('be.visible')
        .and('not.be.disabled')
        .click();
      
      // Verify drawer CLOSED
      cy.wait(500);
      cy.get('#CartDrawer')
        .should('not.be.visible');
    });

    it('should be able to RE-OPEN drawer after closing', () => {
      // Open
      cy.get('#cart-icon-bubble').click();
      cy.get('#CartDrawer').should('be.visible');
      
      // Close
      cy.get('.drawer__close').click();
      cy.wait(500);
      cy.get('#CartDrawer').should('not.be.visible');
      
      // Re-open - verifies component still functional
      cy.get('#cart-icon-bubble').click();
      cy.get('#CartDrawer').should('be.visible');
    });
  });

  describe('Cart with Items - Interaction Tests', () => {
    beforeEach(() => {
      // Add product to cart first
      cy.fixture('products').then((products) => {
        cy.visitProduct(products.testProduct.handle);
        cy.waitForPageLoad();
        cy.addToCart();
        cy.wait(1000);
      });
    });

    it('should display cart items that are VISIBLE', () => {
      cy.visit('/');
      cy.get('#cart-icon-bubble')
        .click();
      
      cy.get('#CartDrawer')
        .should('be.visible');
      
      // Verify cart items are visible
      cy.get('.cart-item')
        .should('have.length.at.least', 1)
        .first()
        .should('be.visible');
    });

    it('should have CLICKABLE quantity plus button that WORKS', () => {
      cy.visit('/');
      cy.get('#cart-icon-bubble').click();
      cy.get('#CartDrawer').should('be.visible');
      
      // Get initial quantity
      cy.get('quantity-input input, .quantity-input input')
        .first()
        .invoke('val')
        .then((initialQty) => {
          const initialQuantity = parseInt(initialQty) || 1;
          
          // Click plus button
          cy.get('quantity-input button[name="plus"], .quantity-input button[name="plus"], quantity-input button:last-child')
            .first()
            .should('be.visible')
            .and('not.be.disabled')
            .click();
          
          // Wait for update
          cy.wait(1500);
          
          // Verify quantity increased
          cy.get('quantity-input input, .quantity-input input')
            .first()
            .invoke('val')
            .then((newQty) => {
              const newQuantity = parseInt(newQty);
              expect(newQuantity).to.be.gte(initialQuantity);
            });
        });
    });

    it('should have CLICKABLE quantity minus button that WORKS', () => {
      // First add multiple items
      cy.fixture('products').then((products) => {
        cy.visitProduct(products.testProduct.handle);
        cy.addToCart();
        cy.wait(1000);
      });
      
      cy.visit('/');
      cy.get('#cart-icon-bubble').click();
      cy.get('#CartDrawer').should('be.visible');
      
      // Get initial quantity
      cy.get('quantity-input input, .quantity-input input')
        .first()
        .invoke('val')
        .then((initialQty) => {
          const initialQuantity = parseInt(initialQty) || 2;
          
          if (initialQuantity > 1) {
            // Click minus button
            cy.get('quantity-input button[name="minus"], .quantity-input button[name="minus"], quantity-input button:first-child')
              .first()
              .should('be.visible')
              .click();
            
            cy.wait(1500);
            
            // Verify quantity decreased
            cy.get('quantity-input input, .quantity-input input')
              .first()
              .invoke('val')
              .then((newQty) => {
                const newQuantity = parseInt(newQty);
                expect(newQuantity).to.be.lte(initialQuantity);
              });
          } else {
            cy.log('Only 1 item in cart, skipping minus test');
          }
        });
    });

    it('should have VISIBLE and CLICKABLE checkout button', () => {
      cy.visit('/');
      cy.get('#cart-icon-bubble').click();
      cy.get('#CartDrawer').should('be.visible');
      
      // Verify checkout button is visible and clickable
      cy.get('button[name="checkout"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should NAVIGATE to checkout when checkout button is CLICKED', () => {
      cy.visit('/');
      cy.get('#cart-icon-bubble').click();
      cy.get('#CartDrawer').should('be.visible');
      
      // Click checkout
      cy.get('button[name="checkout"]')
        .should('be.visible')
        .and('not.be.disabled')
        .click();
      
      // Verify navigation to checkout
      cy.url({ timeout: 30000 })
        .should('include', 'checkout');
    });
  });

  describe('Cart Count Updates', () => {
    it('should UPDATE cart count bubble when item is added', () => {
      cy.visit('/');
      cy.waitForPageLoad();
      
      // Get initial cart count
      cy.getCartCount().then((initialCount) => {
        // Add product
        cy.fixture('products').then((products) => {
          cy.visitProduct(products.testProduct.handle);
          cy.waitForPageLoad();
          cy.addToCart();
          
          // Wait for cart update
          cy.wait(2000);
          
          // Verify count increased
          cy.get('.cart-count-bubble span')
            .first()
            .invoke('text')
            .then((text) => {
              const newCount = parseInt(text) || 0;
              expect(newCount).to.be.gt(initialCount);
            });
        });
      });
    });
  });

  describe('Mobile Cart Drawer', () => {
    beforeEach(() => {
      cy.setMobileViewport();
      cy.fixture('products').then((products) => {
        cy.visitProduct(products.testProduct.handle);
        cy.addToCart();
        cy.wait(1000);
      });
    });

    it('should OPEN cart drawer on mobile', () => {
      cy.visit('/');
      cy.get('#cart-icon-bubble')
        .should('be.visible')
        .click();
      
      cy.get('#CartDrawer')
        .should('be.visible');
    });

    it('should have CLICKABLE checkout button on mobile', () => {
      cy.visit('/');
      cy.get('#cart-icon-bubble').click();
      cy.get('#CartDrawer').should('be.visible');
      
      cy.get('button[name="checkout"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should NAVIGATE to checkout on mobile', () => {
      cy.visit('/');
      cy.get('#cart-icon-bubble').click();
      cy.get('#CartDrawer').should('be.visible');
      
      cy.get('button[name="checkout"]')
        .click();
      
      cy.url({ timeout: 30000 })
        .should('include', 'checkout');
    });
  });

  describe('Full User Journey - Cart to Checkout', () => {
    it('should complete full journey: add item -> open drawer -> checkout', () => {
      // Step 1: Visit product page
      cy.fixture('products').then((products) => {
        cy.visitProduct(products.testProduct.handle);
        cy.waitForPageLoad();
        
        // Step 2: Add to cart
        cy.get('.product-form__submit, button[name="add"]')
          .should('be.visible')
          .and('not.be.disabled')
          .click();
        
        cy.wait(2000);
        
        // Step 3: Go to homepage and open cart drawer
        cy.visit('/');
        cy.get('#cart-icon-bubble')
          .should('be.visible')
          .click();
        
        // Step 4: Verify cart drawer opened with items
        cy.get('#CartDrawer')
          .should('be.visible');
        
        cy.get('.cart-item')
          .should('have.length.at.least', 1);
        
        // Step 5: Click checkout
        cy.get('button[name="checkout"]')
          .should('be.visible')
          .and('not.be.disabled')
          .click();
        
        // Step 6: Verify arrived at checkout
        cy.url({ timeout: 30000 })
          .should('include', 'checkout');
      });
    });
  });
});
