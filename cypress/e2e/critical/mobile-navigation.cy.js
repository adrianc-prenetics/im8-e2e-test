/// <reference types="cypress" />

/**
 * Mobile Navigation Tests - CRITICAL USER INTERACTIONS
 * Tests that the mobile navigation is fully FUNCTIONAL, not just visible
 * 
 * CRITICAL: We had a bug where mobile nav couldn't open - these tests prevent regression
 */

describe('Mobile Navigation - Critical User Interactions', () => {
  beforeEach(() => {
    cy.setMobileViewport();
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Hamburger Menu Opens and Functions', () => {
    it('should open drawer when hamburger is CLICKED', () => {
      // Verify hamburger is visible AND clickable
      cy.get('header-drawer summary.header__icon--menu')
        .should('be.visible')
        .and('not.be.disabled')
        .click();
      
      // Verify drawer actually OPENS (not just exists)
      cy.get('#menu-drawer')
        .should('be.visible');
      
      // Verify drawer inner content is rendered (not empty)
      cy.get('.Header_drawer_inner_new')
        .should('be.visible')
        .and('not.be.empty');
    });

    it('should display menu items that are VISIBLE and CLICKABLE', () => {
      // Open the drawer
      cy.get('header-drawer summary.header__icon--menu')
        .should('be.visible')
        .click();
      
      cy.get('#menu-drawer')
        .should('be.visible');
      
      // Verify menu items exist and are visible
      cy.get('.menu-drawer__menu-item')
        .should('have.length.at.least', 1)
        .first()
        .should('be.visible');
      
      // Verify menu items have clickable links
      cy.get('.menu-drawer__menu-item a, .menu-drawer__menu-item summary')
        .first()
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should expand submenu when parent menu item is CLICKED', () => {
      // Open the drawer
      cy.get('header-drawer summary.header__icon--menu')
        .should('be.visible')
        .click();
      
      cy.get('#menu-drawer')
        .should('be.visible');
      
      // Find a menu item with submenu (details element)
      cy.get('#menu-drawer details').then(($details) => {
        if ($details.length > 0) {
          // Click the summary to expand submenu
          cy.wrap($details)
            .first()
            .find('summary')
            .should('be.visible')
            .click();
          
          // Verify submenu OPENS and is VISIBLE
          cy.get('.menu-drawer__submenu, .menu-drawer__inner-submenu')
            .should('be.visible')
            .and('not.be.empty');
          
          // Verify submenu has clickable items
          cy.get('.menu-drawer__submenu a, .menu-drawer__inner-submenu a')
            .should('have.length.at.least', 1)
            .first()
            .should('be.visible');
        } else {
          cy.log('No submenu items found - skipping submenu test');
        }
      });
    });

    it('should NAVIGATE when submenu link is CLICKED', () => {
      // Open the drawer
      cy.get('header-drawer summary.header__icon--menu')
        .should('be.visible')
        .click();
      
      cy.get('#menu-drawer')
        .should('be.visible');
      
      // Get current URL
      cy.url().then((initialUrl) => {
        // Find and expand a submenu
        cy.get('#menu-drawer details').then(($details) => {
          if ($details.length > 0) {
            cy.wrap($details)
              .first()
              .find('summary')
              .click();
            
            // Wait for submenu to be visible
            cy.get('.menu-drawer__submenu a, .menu-drawer__inner-submenu a', { timeout: 5000 })
              .first()
              .should('be.visible')
              .then(($link) => {
                const href = $link.attr('href');
                if (href && href !== '#' && !href.includes('javascript:')) {
                  cy.wrap($link).click();
                  // Verify navigation ACTUALLY HAPPENED
                  cy.url().should('not.eq', initialUrl);
                }
              });
          } else {
            // No submenus, try direct menu links
            cy.get('.menu-drawer__menu-item a')
              .first()
              .then(($link) => {
                const href = $link.attr('href');
                if (href && href !== '#' && !href.includes('javascript:')) {
                  cy.wrap($link).click();
                  cy.url().should('not.eq', initialUrl);
                }
              });
          }
        });
      });
    });

    it('should NAVIGATE when top-level menu link is CLICKED', () => {
      // Open the drawer
      cy.get('header-drawer summary.header__icon--menu')
        .should('be.visible')
        .click();
      
      cy.get('#menu-drawer')
        .should('be.visible');
      
      cy.url().then((initialUrl) => {
        // Find a direct link (not a details/summary)
        cy.get('.menu-drawer__menu-item').then(($items) => {
          // Look for a menu item that is a direct link
          const $directLinks = $items.find('> a[href]:not([href="#"])');
          
          if ($directLinks.length > 0) {
            cy.wrap($directLinks)
              .first()
              .should('be.visible')
              .click();
            
            // Verify navigation happened
            cy.url().should('not.eq', initialUrl);
          } else {
            // All items have submenus, expand one and click
            cy.get('#menu-drawer details')
              .first()
              .find('summary')
              .click();
            
            cy.get('.menu-drawer__submenu a, .menu-drawer__inner-submenu a')
              .first()
              .should('be.visible')
              .click();
            
            cy.url().should('not.eq', initialUrl);
          }
        });
      });
    });
  });

  describe('Drawer Close Functionality', () => {
    it('should CLOSE drawer when close button is CLICKED', () => {
      // Open the drawer
      cy.get('header-drawer summary.header__icon--menu')
        .should('be.visible')
        .click();
      
      cy.get('#menu-drawer')
        .should('be.visible');
      
      // Click close button
      cy.get('.menu-drawer__close-button')
        .should('be.visible')
        .and('not.be.disabled')
        .click();
      
      // Verify drawer is CLOSED (not visible)
      cy.get('#menu-drawer')
        .should('not.be.visible');
    });

    it('should be able to RE-OPEN drawer after closing', () => {
      // Open drawer
      cy.get('header-drawer summary.header__icon--menu')
        .click();
      cy.get('#menu-drawer').should('be.visible');
      
      // Close drawer
      cy.get('.menu-drawer__close-button').click();
      cy.get('#menu-drawer').should('not.be.visible');
      
      // Re-open drawer - this verifies the component is still functional
      cy.get('header-drawer summary.header__icon--menu')
        .should('be.visible')
        .click();
      
      cy.get('#menu-drawer')
        .should('be.visible');
      
      // Verify content is still there
      cy.get('.menu-drawer__menu-item')
        .should('have.length.at.least', 1);
    });
  });

  describe('Menu Content Verification', () => {
    it('should render mega menu content (not empty)', () => {
      // Open the drawer
      cy.get('header-drawer summary.header__icon--menu')
        .click();
      
      cy.get('#menu-drawer')
        .should('be.visible');
      
      // Verify the menu has actual content
      cy.get('#Details-menu-drawer-container, .menu-drawer__menu')
        .should('be.visible')
        .and('not.be.empty');
      
      // Verify menu items have text content
      cy.get('.menu-drawer__menu-item')
        .first()
        .invoke('text')
        .should('not.be.empty');
    });

    it('should have all menu items with valid href or expandable', () => {
      cy.get('header-drawer summary.header__icon--menu')
        .click();
      
      cy.get('#menu-drawer')
        .should('be.visible');
      
      // Each menu item should either have a link or be expandable
      cy.get('.menu-drawer__menu-item').each(($item) => {
        const hasLink = $item.find('a[href]').length > 0;
        const hasDetails = $item.find('details').length > 0 || $item.closest('details').length > 0;
        const isExpandable = $item.find('summary').length > 0;
        
        expect(hasLink || hasDetails || isExpandable).to.be.true;
      });
    });
  });

  describe('Full User Journey - Mobile Navigation', () => {
    it('should complete full navigation journey: open -> browse -> navigate -> arrive', () => {
      // Step 1: Open hamburger menu
      cy.get('header-drawer summary.header__icon--menu')
        .should('be.visible')
        .click();
      
      // Step 2: Verify drawer opened
      cy.get('#menu-drawer')
        .should('be.visible');
      
      // Step 3: Find and click a navigation link
      cy.url().then((startUrl) => {
        // Try to find any clickable link in the menu
        cy.get('#menu-drawer').then(($drawer) => {
          // First try direct links
          const $directLinks = $drawer.find('a[href]:not([href="#"]):not([href*="javascript"])');
          
          if ($directLinks.filter(':visible').length > 0) {
            cy.wrap($directLinks.filter(':visible').first())
              .click();
          } else {
            // Expand a submenu first
            cy.get('#menu-drawer details summary')
              .first()
              .click();
            
            cy.get('.menu-drawer__submenu a, .menu-drawer__inner-submenu a')
              .filter(':visible')
              .first()
              .click();
          }
        });
        
        // Step 4: Verify navigation completed
        cy.url().should('not.eq', startUrl);
        
        // Step 5: Verify new page loaded
        cy.get('body').should('be.visible');
        cy.waitForPageLoad();
      });
    });
  });
});
