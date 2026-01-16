/**
 * Mobile Navigation Tests
 * 
 * Tests the mobile navigation including:
 * - Hamburger menu button visibility
 * - Mobile drawer opening on hamburger click
 * - Navigation links in mobile drawer
 * 
 * Reference: /Users/adrianchan/shopify-im8-ui/snippets/header-drawer.liquid
 * 
 * NOTE: Tests use .should('be.visible') to catch CSS bugs that hide elements
 */
describe('Mobile Navigation - Critical Interactions', () => {
  beforeEach(() => {
    cy.viewport(375, 812);
    cy.fastVisit('/');
    // Kill popups to ensure body is visible (handles Klaviyo)
    cy.killPopups();
  });

  it('page loads on mobile', () => {
    cy.log('[TEST] Starting: page loads on mobile');
    cy.get('body').should('be.visible');
    cy.log('[TEST] Mobile page load completed');
  });

  it('hamburger menu button is visible', () => {
    cy.log('[TEST] Starting: hamburger menu button is visible');
    
    // Reference: header-drawer.liquid - summary with class header__icon--menu
    // Hamburger button MUST be visible on mobile - this catches CSS bugs
    cy.get('button[aria-label*="Menu"], summary.header__icon--menu, [class*="menu"] button, header button', { timeout: 15000 })
      .first()
      .should('be.visible')
      .then($btn => {
        cy.log(`[TEST] Found visible hamburger button: ${$btn.prop('tagName')}`);
      });
    
    cy.log('[TEST] Hamburger menu button is visible');
  });

  it('mobile drawer opens and is visible on hamburger click', () => {
    cy.log('[TEST] Starting: mobile drawer opens and is visible');
    
    // Click the hamburger/menu button
    // Reference: header-drawer.liquid - details#Details-menu-drawer-container
    cy.get('button[aria-label*="Menu"], summary.header__icon--menu, [class*="menu"] button, header button', { timeout: 15000 })
      .first()
      .should('be.visible')
      .click();
    
    // Wait for drawer animation
    cy.wait(500);
    
    // Mobile drawer MUST be visible after clicking - this catches hidden drawer bugs
    // Reference: header-drawer.liquid - div#menu-drawer with class menu-drawer
    cy.get('#menu-drawer, .menu-drawer, [class*="drawer"][class*="menu"]', { timeout: 10000 })
      .should('be.visible')
      .then($drawer => {
        cy.log(`[TEST] Mobile drawer is visible: ${$drawer.attr('class')?.substring(0, 50)}`);
      });
    
    cy.log('[TEST] Mobile drawer is visible');
  });

  it('mobile drawer has visible navigation links', () => {
    cy.log('[TEST] Starting: mobile drawer has visible navigation links');
    
    // Open the drawer first
    cy.get('button[aria-label*="Menu"], summary.header__icon--menu, [class*="menu"] button, header button', { timeout: 15000 })
      .first()
      .should('be.visible')
      .click();
    
    cy.wait(500);
    
    // Navigation links MUST be visible in the drawer - this catches hidden links bugs
    // Reference: header-drawer.liquid - ul.menu-drawer__menu
    cy.get('.menu-drawer a, #menu-drawer a, [class*="drawer"] nav a', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .first()
      .should('be.visible')
      .then($links => {
        cy.log(`[TEST] Navigation links are visible in mobile drawer`);
      });
    
    cy.log('[TEST] Mobile drawer navigation links are visible');
  });
});
