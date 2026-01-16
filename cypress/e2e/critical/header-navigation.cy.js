/// <reference types="cypress" />

/**
 * Header Navigation Tests - CRITICAL USER INTERACTIONS
 * Tests that header navigation elements are FUNCTIONAL
 * 
 * NOTE: Search tests excluded - search is disabled on this store
 */

describe('Header Navigation - Critical User Interactions', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Logo Functionality', () => {
    it('should have VISIBLE and CLICKABLE logo', () => {
      cy.get('.header__heading-logo')
        .should('be.visible');
      
      cy.get('.header__heading-logo')
        .closest('a')
        .should('have.attr', 'href');
    });

    it('should NAVIGATE to homepage when logo is CLICKED', () => {
      // First navigate away
      cy.visit('/collections/all');
      cy.waitForPageLoad();
      
      cy.url().then((currentUrl) => {
        // Click logo
        cy.get('.header__heading-logo')
          .closest('a')
          .should('be.visible')
          .click();
        
        // Verify navigation happened
        cy.url().should('eq', Cypress.config('baseUrl') + '/');
      });
    });
  });

  describe('Desktop Menu Functionality', () => {
    beforeEach(() => {
      cy.setDesktopViewport();
      cy.visit('/');
      cy.waitForPageLoad();
    });

    it('should have VISIBLE desktop menu', () => {
      cy.get('.header__inline-menu, .header_left_new')
        .should('be.visible');
    });

    it('should have CLICKABLE menu items', () => {
      cy.get('.header__inline-menu a, .header_left_new a')
        .first()
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should NAVIGATE when menu item is CLICKED', () => {
      cy.url().then((initialUrl) => {
        cy.get('.header__inline-menu a, .header_left_new a')
          .first()
          .then(($link) => {
            const href = $link.attr('href');
            if (href && href !== '#' && !href.includes('javascript:')) {
              cy.wrap($link).click();
              cy.url().should('not.eq', initialUrl);
            }
          });
      });
    });

    it('should SHOW mega menu on hover', () => {
      cy.get('.header__inline-menu details, header-menu details')
        .first()
        .then(($details) => {
          if ($details.length > 0) {
            cy.wrap($details)
              .find('summary')
              .trigger('mouseenter');
            
            cy.wait(500);
            
            cy.get('.mega-menu, .header__submenu')
              .should('be.visible');
          } else {
            cy.log('No mega menu triggers found');
          }
        });
    });
  });

  describe('Cart Icon Functionality', () => {
    it('should have VISIBLE and CLICKABLE cart icon', () => {
      cy.get('#cart-icon-bubble')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should OPEN cart drawer when CLICKED', () => {
      cy.get('#cart-icon-bubble')
        .click();
      
      cy.get('#CartDrawer')
        .should('be.visible');
    });
  });

  describe('Sticky Header Functionality', () => {
    it('should remain VISIBLE when scrolling', () => {
      cy.scrollTo(0, 500);
      cy.wait(500);
      
      cy.get('sticky-header, .header-wrapper')
        .should('be.visible');
    });

    it('should have FUNCTIONAL elements after scroll', () => {
      cy.scrollTo(0, 500);
      cy.wait(500);
      
      // Cart icon should still be clickable
      cy.get('#cart-icon-bubble')
        .should('be.visible')
        .click();
      
      cy.get('#CartDrawer')
        .should('be.visible');
    });
  });

  describe('Mobile Header', () => {
    beforeEach(() => {
      cy.setMobileViewport();
    });

    it('should have VISIBLE hamburger menu on mobile', () => {
      cy.get('header-drawer summary.header__icon--menu')
        .should('be.visible');
    });

    it('should have CLICKABLE hamburger that OPENS drawer', () => {
      cy.get('header-drawer summary.header__icon--menu')
        .should('be.visible')
        .click();
      
      cy.get('#menu-drawer')
        .should('be.visible');
    });

    it('should have VISIBLE and CLICKABLE cart icon on mobile', () => {
      cy.get('#cart-icon-bubble')
        .should('be.visible')
        .click();
      
      cy.get('#CartDrawer')
        .should('be.visible');
    });
  });
});
