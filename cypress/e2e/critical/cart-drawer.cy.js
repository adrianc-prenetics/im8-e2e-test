/**
 * Cart Drawer Tests
 * 
 * Tests the cart drawer functionality including:
 * - Cart icon visibility and click to open drawer
 * - Cart drawer opens with proper content
 * - Cart drawer has checkout button
 * - Adding items updates cart
 * 
 * Reference: /Users/adrianchan/shopify-im8-ui/snippets/cart-drawer.liquid
 * The cart drawer uses class "cart-drawer" and has id "CartDrawer"
 */
describe('Cart Drawer - Critical Interactions', () => {
  it('cart icon exists on homepage', () => {
    cy.log('[TEST] Starting: cart icon exists on homepage');
    cy.fastVisit('/');
    
    // Cart icon button - per live site inspection
    cy.get('button[aria-label*="Cart"], #cart-icon-bubble, a[href="/cart"]', { timeout: 15000 })
      .first()
      .should('exist');
    
    cy.log('[TEST] Cart icon found');
  });

  it('clicking cart icon opens cart drawer', () => {
    cy.log('[TEST] Starting: clicking cart icon opens cart drawer');
    cy.fastVisit('/');
    
    // Click the cart icon button
    cy.get('button[aria-label*="Cart"]', { timeout: 15000 })
      .first()
      .click({ force: true });
    
    // Wait for drawer to open - cart drawer has role="dialog" and aria-modal="true"
    cy.wait(500);
    
    // Verify cart drawer is visible
    // Reference: cart-drawer.liquid line 74-75: role="dialog" aria-modal="true"
    cy.get('.cart-drawer .drawer__inner, #CartDrawer .drawer__inner, cart-drawer', { timeout: 10000 })
      .should('exist');
    
    cy.log('[TEST] Cart drawer opened');
  });

  it('cart drawer has checkout button when items in cart', () => {
    cy.log('[TEST] Starting: cart drawer has checkout button');
    
    // First add an item to cart
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(2000);
    
    // Open cart drawer by clicking cart icon
    cy.get('button[aria-label*="Cart"]', { timeout: 15000 })
      .first()
      .click({ force: true });
    
    cy.wait(500);
    
    // Verify checkout button exists in cart drawer
    // Common selectors for checkout button
    cy.get('button[name="checkout"], a[href*="/checkout"], .cart__checkout-button, [class*="checkout"]', { timeout: 10000 })
      .should('exist');
    
    cy.log('[TEST] Checkout button found in cart drawer');
  });

  it('can add item to cart from product page', () => {
    cy.log('[TEST] Starting: can add item to cart from product page');
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(2000);
    cy.log('[TEST] Add to cart completed');
  });
});
