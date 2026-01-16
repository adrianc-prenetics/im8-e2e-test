/// <reference types="cypress" />

/**
 * Sticky ATC Bar Tests - CRITICAL USER INTERACTIONS
 * 
 * Tests the sticky add-to-cart bar on product pages.
 * Desktop: Shows "Add to cart - $XX/mo" with product image
 * Mobile: Shows "Add" button only (product details hidden)
 * 
 * Selectors:
 * - Container: .product-buy-sticky-container
 * - Button: .product-buy-sticky__button
 * - Plan dropdown: #sticky-buy-dropdown
 * - Desktop text: .text-desktop
 * - Mobile text: .text-mobile
 */

describe('Sticky ATC Bar - Critical User Interactions', () => {
  const productUrl = '/products/essentials';

  beforeEach(() => {
    cy.visit(productUrl);
    cy.waitForPageLoad();
  });

  describe('Desktop View', () => {
    beforeEach(() => {
      cy.setDesktopViewport();
    });

    it('should display sticky bar after page load', () => {
      cy.get('.product-buy-sticky-container', { timeout: 10000 })
        .should('exist')
        .and('be.visible')
        .and('have.class', 'initialized');
    });

    it('should show desktop text on sticky button', () => {
      cy.get('.product-buy-sticky-container', { timeout: 10000 }).should('be.visible');
      cy.get('.product-buy-sticky__button .text-desktop')
        .should('be.visible')
        .and('contain.text', 'Add to cart');
      cy.get('.product-buy-sticky__button .text-mobile').should('not.be.visible');
    });

    it('should display product details on desktop', () => {
      cy.get('.product-buy-sticky-container', { timeout: 10000 }).should('be.visible');
      cy.get('.product-buy-sticky-container .product-image').should('be.visible');
      cy.get('.product-buy-sticky-container .product-title')
        .should('be.visible')
        .and('not.be.empty');
    });

    it('should have clickable plan dropdown', () => {
      cy.get('.product-buy-sticky-container', { timeout: 10000 }).should('be.visible');
      cy.get('#sticky-buy-dropdown').should('be.visible').click();
      cy.get('#sticky-buy-dropdown .dropdown-option, #sticky-buy-dropdown .custom-dropdown__option')
        .should('be.visible');
    });

    it('should have clickable ATC button', () => {
      cy.get('.product-buy-sticky-container', { timeout: 10000 }).should('be.visible');
      cy.get('.product-buy-sticky__button')
        .should('be.visible')
        .and('not.be.disabled')
        .and('not.have.class', 'disabled');
    });

    it('should add to cart when sticky button is clicked', () => {
      cy.get('.product-buy-sticky-container', { timeout: 10000 }).should('be.visible');
      cy.getCartCount().then((initialCount) => {
        cy.get('.product-buy-sticky__button').should('not.be.disabled').click();
        cy.wait(2000);
        cy.getCartCount().should('be.gt', initialCount);
      });
    });

    it('should show price in button text', () => {
      cy.get('.product-buy-sticky-container', { timeout: 10000 }).should('be.visible');
      cy.get('.product-buy-sticky__button .button-text-price')
        .should('exist')
        .invoke('text')
        .should('match', /\$[\d,.]+/);
    });
  });

  describe('Mobile View', () => {
    beforeEach(() => {
      cy.setMobileViewport();
    });

    it('should display sticky bar on mobile', () => {
      cy.get('.product-buy-sticky-container', { timeout: 10000 })
        .should('exist')
        .and('be.visible');
    });

    it('should show mobile text on sticky button', () => {
      cy.get('.product-buy-sticky-container', { timeout: 10000 }).should('be.visible');
      cy.get('.product-buy-sticky__button .text-mobile')
        .should('be.visible')
        .and('contain.text', 'Add');
      cy.get('.product-buy-sticky__button .text-desktop').should('not.be.visible');
    });

    it('should hide product details on mobile', () => {
      cy.get('.product-buy-sticky-container', { timeout: 10000 }).should('be.visible');
      cy.get('.product-buy-sticky-container .product-details').should('not.be.visible');
    });

    it('should have clickable plan dropdown on mobile', () => {
      cy.get('.product-buy-sticky-container', { timeout: 10000 }).should('be.visible');
      cy.get('#sticky-buy-dropdown').should('be.visible').click();
      cy.get('#sticky-buy-dropdown .dropdown-option, #sticky-buy-dropdown .custom-dropdown__option')
        .should('be.visible');
    });

    it('should add to cart from mobile sticky bar', () => {
      cy.get('.product-buy-sticky-container', { timeout: 10000 }).should('be.visible');
      cy.getCartCount().then((initialCount) => {
        cy.get('.product-buy-sticky__button').should('not.be.disabled').click();
        cy.wait(2000);
        cy.getCartCount().should('be.gt', initialCount);
      });
    });
  });

  describe('Button States', () => {
    beforeEach(() => {
      cy.setDesktopViewport();
    });

    it('should show loading state when clicked', () => {
      cy.get('.product-buy-sticky-container', { timeout: 10000 }).should('be.visible');
      cy.get('.product-buy-sticky__button').click();
      cy.get('.product-buy-sticky__button').should('have.class', 'disabled');
      cy.get('.product-buy-sticky__button', { timeout: 5000 }).should('not.have.class', 'disabled');
    });
  });

  describe('Visual Appearance', () => {
    it('should be fixed to bottom of viewport', () => {
      cy.setDesktopViewport();
      cy.get('.product-buy-sticky-container', { timeout: 10000 })
        .should('be.visible')
        .and('have.css', 'position', 'fixed')
        .and('have.css', 'bottom', '0px');
    });
  });
});
