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
 * Reference: /Users/adrianchan/shopify-im8-ui/sections/header.liquid (line 307)
 * 
 * Cart icon: #cart-icon-bubble (a tag with class header__icon header__icon--cart)
 * Cart drawer: cart-drawer custom element with class "cart-drawer drawer"
 * Cart drawer inner: .drawer__inner with role="dialog" aria-modal="true"
 * Checkout button: #CartDrawer-Checkout with class cart__checkout-button and name="checkout"
 * 
 * NOTE: Tests use .should('be.visible') to catch CSS bugs that hide elements
 */
describe('Cart Drawer - Critical Interactions', () => {
  // Cart icon selector from header.liquid line 307
  const cartIconSelector = '#cart-icon-bubble';
  
  // Cart drawer selectors from cart-drawer.liquid
  const cartDrawerSelector = 'cart-drawer.cart-drawer';
  const cartDrawerInnerSelector = '.drawer__inner[role="dialog"]';
  const checkoutButtonSelector = '#CartDrawer-Checkout, button[name="checkout"].cart__checkout-button';
  const cartDrawerOverlay = '#CartDrawer-Overlay';
  
  it('cart icon is visible on homepage', () => {
    cy.log('[TEST] Starting: cart icon is visible on homepage');
    cy.fastVisit('/');
    
    // Kill popups to ensure body is visible (handles Klaviyo)
    cy.killPopups();
    
    // Cart icon MUST be visible to users - this will catch CSS bugs
    cy.get(cartIconSelector, { timeout: 15000 })
      .should('be.visible');
    
    cy.log('[TEST] Cart icon is visible');
  });

  it('clicking cart icon opens cart drawer', () => {
    cy.log('[TEST] Starting: clicking cart icon opens cart drawer');
    cy.fastVisit('/');
    
    // Kill popups to ensure body is visible
    cy.killPopups();
    
    // Cart icon must be visible before clicking
    cy.get(cartIconSelector, { timeout: 15000 })
      .should('be.visible')
      .click();
    
    // Wait for drawer animation to start
    cy.wait(500);
    
    // Cart drawer element should exist
    cy.get(cartDrawerSelector, { timeout: 10000 })
      .should('exist');
    
    // BULLETPROOF: Cart drawer open state check
    // The drawer goes through: opening -> animate + active -> (opening removed)
    // Check for ANY of these classes to indicate drawer is open
    cy.get('cart-drawer', { timeout: 10000 })
      .should(($drawer) => {
        const hasAnimate = $drawer.hasClass('animate');
        const hasActive = $drawer.hasClass('active');
        const hasOpening = $drawer.hasClass('opening');
        const isOpen = hasAnimate || hasActive || hasOpening;
        expect(isOpen, 'cart drawer should be open').to.be.true;
      });
    
    cy.log('[TEST] Cart drawer opened');
  });

  it('cart drawer shows checkout button when items in cart', () => {
    cy.log('[TEST] Starting: cart drawer has checkout button');
    
    // First add an item to cart
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    
    // BULLETPROOF: Wait for cart drawer to be fully ready
    cy.waitForCartDrawerReady({ timeout: 20000 });
    
    // The cart drawer should already be open after adding to cart
    // Check that checkout button is visible in the open drawer
    cy.get(checkoutButtonSelector, { timeout: 10000 })
      .should('be.visible');
    
    cy.log('[TEST] Checkout button is visible in cart drawer');
  });

  it('can add item to cart from product page', () => {
    cy.log('[TEST] Starting: can add item to cart from product page');
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    
    // BULLETPROOF: Wait for cart drawer to open (confirms ATC succeeded)
    cy.waitForCartDrawerOpen({ timeout: 15000 });
    
    cy.log('[TEST] Add to cart completed');
  });
});
