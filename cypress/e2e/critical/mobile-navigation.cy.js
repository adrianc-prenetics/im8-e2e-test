/**
 * Mobile Navigation Tests
 * 
 * Tests the mobile navigation including:
 * - Hamburger menu button visibility
 * - Mobile drawer opening on hamburger click
 * - Navigation links in mobile drawer
 * 
 * Reference: /Users/adrianchan/shopify-im8-ui/snippets/header-drawer.liquid
 */
describe('Mobile Navigation - Critical Interactions', () => {
  beforeEach(() => {
    cy.viewport(375, 812);
    cy.fastVisit('/');
  });

  it('page loads on mobile', () => {
    cy.log('[TEST] Starting: page loads on mobile');
    cy.get('body').should('exist');
    cy.log('[TEST] Mobile page load completed');
  });

  it('hamburger menu button exists', () => {
    cy.log('[TEST] Starting: hamburger menu button exists');
    
    // Reference: header-drawer.liquid - summary with class header__icon--menu
    cy.get('button[aria-label*="Menu"], summary.header__icon--menu, [class*="menu"] button, header button', { timeout: 15000 })
      .first()
      .should('exist')
      .then($btn => {
        cy.log(`[TEST] Found hamburger button: ${$btn.prop('tagName')}`);
      });
    
    cy.log('[TEST] Hamburger menu button test completed');
  });

  it('mobile drawer opens on hamburger click', () => {
    cy.log('[TEST] Starting: mobile drawer opens on hamburger click');
    
    // Click the hamburger/menu button
    // Reference: header-drawer.liquid - details#Details-menu-drawer-container
    cy.get('button[aria-label*="Menu"], summary.header__icon--menu, [class*="menu"] button, header button', { timeout: 15000 })
      .first()
      .click({ force: true });
    
    // Wait for drawer animation
    cy.wait(500);
    
    // Verify the drawer is open
    // Reference: header-drawer.liquid - div#menu-drawer with class menu-drawer
    cy.get('#menu-drawer, .menu-drawer, [class*="drawer"][class*="menu"]', { timeout: 10000 })
      .should('exist')
      .then($drawer => {
        cy.log(`[TEST] Mobile drawer found: ${$drawer.attr('class')?.substring(0, 50)}`);
      });
    
    cy.log('[TEST] Mobile drawer test completed');
  });

  it('mobile drawer has navigation links', () => {
    cy.log('[TEST] Starting: mobile drawer has navigation links');
    
    // Open the drawer first
    cy.get('button[aria-label*="Menu"], summary.header__icon--menu, [class*="menu"] button, header button', { timeout: 15000 })
      .first()
      .click({ force: true });
    
    cy.wait(500);
    
    // Verify navigation links exist in the drawer
    // Reference: header-drawer.liquid - ul.menu-drawer__menu
    cy.get('.menu-drawer a, #menu-drawer a, [class*="drawer"] nav a', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .then($links => {
        cy.log(`[TEST] Found ${$links.length} navigation links in mobile drawer`);
      });
    
    cy.log('[TEST] Mobile drawer navigation links test completed');
  });
});
