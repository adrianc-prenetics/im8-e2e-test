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
 * Actual DOM structure (from header-drawer.liquid):
 *   <header-drawer>
 *     <details id="Details-menu-drawer-container" class="menu-drawer-container">
 *       <summary class="header__icon header__icon--menu header__icon--summary link focus-inset"
 *                aria-label="{{ 'sections.header.menu' | t }}">
 *         <span>{% render 'icon-hamburger' %}{% render 'icon-close' %}</span>
 *       </summary>
 *       <div id="menu-drawer" class="... menu-drawer ...">
 *         <nav class="menu-drawer__navigation">
 *           <ul class="menu-drawer__menu has-submenu list-menu">
 *
 * NOTE: The hamburger is a <summary> element, NOT a <button>.
 * NOTE: Tests use .should('be.visible') to catch CSS bugs that hide elements
 */

// Robust hamburger selector — covers the actual <summary> element from header-drawer.liquid
// plus fallbacks for any button-based implementation
const HAMBURGER_SELECTOR = [
  'header-drawer summary',                    // Custom element > summary (most specific)
  '#Details-menu-drawer-container > summary',  // By container ID
  'summary.header__icon--menu',                // By class on the summary
  '.header__icon--summary',                    // Alternate class on same element
  'summary[aria-label*="Menu"]',               // By aria-label (translated "Menu")
  'summary[aria-label*="menu"]',               // Lowercase variant
  'button[aria-label*="Menu"]',                // Fallback: button variant
].join(', ');

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
    // Hamburger MUST be visible on mobile - this catches CSS bugs
    cy.get(HAMBURGER_SELECTOR, { timeout: 30000 })
      .first()
      .should('be.visible')
      .then($btn => {
        cy.log(`[TEST] Found visible hamburger: <${$btn.prop('tagName').toLowerCase()}> class="${$btn.attr('class')?.substring(0, 60)}"`);
      });

    cy.log('[TEST] Hamburger menu button is visible');
  });

  it('mobile drawer opens and is visible on hamburger click', () => {
    cy.log('[TEST] Starting: mobile drawer opens and is visible');

    // Click the hamburger/menu summary element
    // Reference: header-drawer.liquid - details#Details-menu-drawer-container
    cy.get(HAMBURGER_SELECTOR, { timeout: 30000 })
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
    cy.get(HAMBURGER_SELECTOR, { timeout: 30000 })
      .first()
      .should('be.visible')
      .click();

    cy.wait(500);

    // Navigation links MUST be visible in the drawer - this catches hidden links bugs
    // Reference: header-drawer.liquid - ul.menu-drawer__menu
    // Filter to only visible links (some may have opacity: 0 for animation)
    cy.get('.menu-drawer a, #menu-drawer a, [class*="drawer"] nav a', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .filter(':visible')
      .should('have.length.greaterThan', 0)
      .then($links => {
        cy.log(`[TEST] Found ${$links.length} visible navigation links in mobile drawer`);
      });

    cy.log('[TEST] Mobile drawer navigation links are visible');
  });
});
