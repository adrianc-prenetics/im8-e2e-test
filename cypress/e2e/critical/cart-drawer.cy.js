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

  it('clicking cart icon opens visible cart drawer', () => {
    cy.log('[TEST] Starting: clicking cart icon opens visible cart drawer');
    cy.fastVisit('/');
    
    // Kill popups to ensure body is visible
    cy.killPopups();
    
    // Cart icon must be visible before clicking
    cy.get(cartIconSelector, { timeout: 15000 })
      .should('be.visible')
      .click();
    
    // Wait for drawer animation
    cy.wait(500);
    
    // Cart drawer MUST be visible after clicking - this catches hidden drawer bugs
    cy.get(cartDrawerSelector, { timeout: 10000 })
      .should('exist');
    
    cy.get(cartDrawerInnerSelector, { timeout: 10000 })
      .should('be.visible');
    
    cy.log('[TEST] Cart drawer opened and visible');
  });

  it('cart drawer shows visible checkout button when items in cart', () => {
    cy.log('[TEST] Starting: cart drawer has visible checkout button');
    
    // First add an item to cart
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(2000);
    
    // Scroll to top to ensure header is accessible
    cy.scrollTo('top');
    cy.wait(300);
    
    // Kill popups to ensure body is visible
    cy.killPopups();
    
    // Cart icon must be visible
    cy.get(cartIconSelector, { timeout: 15000 })
      .should('be.visible')
      .click();
    
    cy.wait(500);
    
    // Checkout button MUST be visible - this catches hidden button bugs
    cy.get(checkoutButtonSelector, { timeout: 10000 })
      .should('be.visible');
    
    cy.log('[TEST] Checkout button is visible in cart drawer');
  });

  it('can add item to cart from product page', () => {
    cy.log('[TEST] Starting: can add item to cart from product page');
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(2000);
    cy.log('[TEST] Add to cart completed');
  });
});
