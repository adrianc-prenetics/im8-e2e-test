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
    cy.killPopups();
    cy.wait(500);
    cy.killPopups();
  });

  it('header exists with logo', () => {
    cy.log('[TEST] Starting: header exists with logo');
    cy.killPopups();

    // Header element from theme: <header class="header ..."> wrapped in <sticky-header>
    // Use generous timeout for CI where JS/CSS can be slow to load
    cy.get('header.header, sticky-header header, [role="banner"], .header-wrapper header', { timeout: 30000 }).should('exist');

    // Logo link to homepage
    cy.get('a[href="/"]', { timeout: 15000 }).should('exist');

    cy.log('[TEST] Header test completed');
  });

  it('navigation links exist', () => {
    cy.log('[TEST] Starting: navigation links exist');

    // Navigation links are in nav element — generous timeout for CI
    cy.get('nav a, [role="navigation"] a', { timeout: 30000 })
      .should('have.length.greaterThan', 0);

    cy.log('[TEST] Navigation links found');
  });

  it('desktop mega menu has product links', () => {
    cy.log('[TEST] Starting: desktop mega menu has product links');

    cy.viewport(1280, 720);
    cy.killPopups();

    // The header mega menu now shows product links directly (no "Shop" parent link)
    cy.get('.mega-menu__link, [id^="MegaMenu-Content"] a', { timeout: 30000 })
      .should('have.length.greaterThan', 0);

    // Verify key product links exist in the mega menu
    cy.get('a[href*="/products/essentials"], a[href*="/products/longevity"]', { timeout: 15000 })
      .should('have.length.greaterThan', 0);

    cy.log('[TEST] Desktop mega menu test completed');
  });
});
