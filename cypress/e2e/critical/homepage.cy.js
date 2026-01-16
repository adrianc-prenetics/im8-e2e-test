/// <reference types="cypress" />

/**
 * Homepage Tests - CRITICAL USER INTERACTIONS
 * Tests that the homepage loads and critical elements are FUNCTIONAL
 */

describe('Homepage - Critical User Interactions', () => {
  describe('Page Load', () => {
    it('should load homepage successfully', () => {
      cy.visit('/');
      cy.waitForPageLoad();
      
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });

    it('should return 200 status code', () => {
      cy.request('/').then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should load within acceptable time', () => {
      const startTime = Date.now();
      
      cy.visit('/');
      cy.waitForPageLoad();
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(30000);
      });
    });
  });

  describe('Header Functionality', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.waitForPageLoad();
    });

    it('should have VISIBLE header', () => {
      cy.get('header, .header-wrapper, sticky-header')
        .should('be.visible');
    });

    it('should have CLICKABLE logo', () => {
      cy.get('.header__heading-logo')
        .should('be.visible');
    });

    it('should have CLICKABLE cart icon', () => {
      cy.get('#cart-icon-bubble')
        .should('be.visible')
        .click();
      
      cy.get('#CartDrawer')
        .should('be.visible');
    });
  });

  describe('Footer Visibility', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.waitForPageLoad();
    });

    it('should have VISIBLE footer when scrolled', () => {
      cy.scrollTo('bottom');
      cy.wait(500);
      
      cy.get('footer, .footer')
        .should('be.visible');
    });
  });

  describe('Mobile Homepage', () => {
    beforeEach(() => {
      cy.setMobileViewport();
      cy.visit('/');
      cy.waitForPageLoad();
    });

    it('should load on mobile', () => {
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });

    it('should have CLICKABLE hamburger menu', () => {
      cy.get('header-drawer summary.header__icon--menu')
        .should('be.visible')
        .click();
      
      cy.get('#menu-drawer')
        .should('be.visible');
    });

    it('should have CLICKABLE cart icon on mobile', () => {
      cy.get('#cart-icon-bubble')
        .should('be.visible')
        .click();
      
      cy.get('#CartDrawer')
        .should('be.visible');
    });

    it('should not have horizontal scroll', () => {
      cy.window().then((win) => {
        const docWidth = win.document.documentElement.scrollWidth;
        const viewportWidth = win.innerWidth;
        
        expect(docWidth).to.be.at.most(viewportWidth + 20);
      });
    });
  });

  describe('Critical Navigation from Homepage', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.waitForPageLoad();
    });

    it('should be able to navigate to product from homepage', () => {
      cy.fixture('products').then((products) => {
        cy.visit(products.testProduct.url);
        cy.waitForPageLoad();
        
        cy.get('.product-form__submit, button[name="add"]')
          .should('be.visible');
      });
    });

    it('should be able to navigate to collection from homepage', () => {
      cy.visit('/collections/all');
      cy.waitForPageLoad();
      
      cy.get('.product-card, .card-product, .card')
        .should('have.length.at.least', 1);
    });
  });
});
