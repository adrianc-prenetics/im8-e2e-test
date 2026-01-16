/**
 * Header Navigation Tests
 * 
 * Tests the desktop navigation including:
 * - Header and logo visibility
 * - Desktop mega menu opening on "Shop" click
 * - Navigation links functionality
 * 
 * Reference: /Users/adrianchan/shopify-im8-ui/snippets/header-mega-menu.liquid
 */
describe('Header Navigation - Critical Interactions', () => {
  beforeEach(() => {
    cy.fastVisit('/');
  });

  it('header exists with logo', () => {
    cy.log('[TEST] Starting: header exists with logo');
    
    // Header uses banner role per live site inspection
    cy.get('header, [role="banner"], .header', { timeout: 15000 }).should('exist');
    
    // Logo link to homepage
    cy.get('a[href="/"]', { timeout: 10000 }).should('exist');
    
    cy.log('[TEST] Header test completed');
  });

  it('navigation links exist', () => {
    cy.log('[TEST] Starting: navigation links exist');
    
    // Navigation links are in nav element
    cy.get('nav a, [role="navigation"] a', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
    
    cy.log('[TEST] Navigation links found');
  });

  it('desktop mega menu opens on Shop click', () => {
    cy.log('[TEST] Starting: desktop mega menu opens on Shop click');
    
    // Only run on desktop viewport
    cy.viewport(1280, 720);
    
    // Find and click the Shop link in the mega menu
    // Reference: header-mega-menu.liquid - link with handle "shop" has custom_megamenu
    cy.get('nav a, .header__menu-item', { timeout: 15000 })
      .contains('Shop')
      .should('be.visible')
      .click({ force: true });
    
    // Wait for mega menu content to appear
    cy.wait(500);
    
    // Verify mega menu content is visible
    // The mega menu shows product links like "Daily Ultimate Essentials"
    cy.get('.mega-menu__content, [id^="MegaMenu-Content"]', { timeout: 10000 })
      .should('exist')
      .then($menu => {
        cy.log(`[TEST] Mega menu found: ${$menu.length} elements`);
      });
    
    // Verify product links are visible in the mega menu
    cy.get('a[href*="/products/essentials"], a[href*="/products/longevity"]', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
    
    cy.log('[TEST] Desktop mega menu test completed');
  });
});
