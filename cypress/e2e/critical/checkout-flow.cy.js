/// <reference types="cypress" />

/**
 * Checkout Flow Tests - CRITICAL USER INTERACTIONS
 * Tests that users can complete the checkout flow
 * 
 * CRITICAL: Users must be able to reach checkout to complete purchases
 * NOTE: Only testing cart drawer checkout, not cart page
 */

describe('Checkout Flow - Critical User Interactions', () => {
  beforeEach(() => {
    // Add product to cart before each test
    cy.fixture('products').then((products) => {
      cy.visitProduct(products.testProduct.handle);
      cy.waitForPageLoad();
      cy.addToCart();
      cy.wait(1500);
    });
  });

  describe('Checkout from Cart Drawer', () => {
    it('should have VISIBLE checkout button in cart drawer', () => {
      cy.visit('/');
      cy.get('#cart-icon-bubble').click();
      cy.get('#CartDrawer').should('be.visible');
      
      cy.get('button[name="checkout"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should NAVIGATE to checkout when button is CLICKED', () => {
      cy.visit('/');
      cy.get('#cart-icon-bubble').click();
      cy.get('#CartDrawer').should('be.visible');
      
      cy.get('button[name="checkout"]')
        .should('be.visible')
        .and('not.be.disabled')
        .click();
      
      // Verify navigation to Shopify checkout
      cy.url({ timeout: 30000 })
        .should('include', 'checkout');
    });

    it('should reach checkout with items in cart', () => {
      cy.visit('/');
      cy.get('#cart-icon-bubble').click();
      cy.get('#CartDrawer').should('be.visible');
      
      // Verify items exist before checkout
      cy.get('.cart-item')
        .should('have.length.at.least', 1);
      
      cy.get('button[name="checkout"]')
        .click();
      
      cy.url({ timeout: 30000 })
        .should('include', 'checkout');
      
      // Verify checkout page loads
      cy.get('body', { timeout: 30000 })
        .should('be.visible');
    });
  });

  describe('Mobile Checkout Flow', () => {
    beforeEach(() => {
      cy.setMobileViewport();
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

  describe('Full Checkout Journey', () => {
    it('should complete full journey: product -> cart drawer -> checkout', () => {
      cy.clearCart();
      
      cy.fixture('products').then((products) => {
        // Step 1: Visit product
        cy.visitProduct(products.testProduct.handle);
        cy.waitForPageLoad();
        
        // Step 2: Add to cart
        cy.get('.product-form__submit, button[name="add"]')
          .should('be.visible')
          .and('not.be.disabled')
          .click();
        
        cy.wait(2000);
        
        // Step 3: Open cart drawer
        cy.get('#cart-icon-bubble').click();
        cy.get('#CartDrawer').should('be.visible');
        
        // Step 4: Verify item in cart
        cy.get('.cart-item')
          .should('have.length.at.least', 1);
        
        // Step 5: Click checkout
        cy.get('button[name="checkout"]')
          .should('be.visible')
          .and('not.be.disabled')
          .click();
        
        // Step 6: Verify at checkout
        cy.url({ timeout: 30000 })
          .should('include', 'checkout');
      });
    });
  });
});
