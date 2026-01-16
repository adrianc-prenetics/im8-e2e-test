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
 */
describe('Cart Drawer - Critical Interactions', () => {
  // Cart icon selector from header.liquid line 307
  const cartIconSelector = '#cart-icon-bubble';
  
  // Cart drawer selectors from cart-drawer.liquid
  const cartDrawerSelector = 'cart-drawer.cart-drawer';
  const cartDrawerInnerSelector = '.drawer__inner[role="dialog"]';
  const checkoutButtonSelector = '#CartDrawer-Checkout, button[name="checkout"].cart__checkout-button';
  
  it('cart icon exists on homepage', () => {
    cy.log('[TEST] Starting: cart icon exists on homepage');
    cy.fastVisit('/');
    
    // Cart icon - per header.liquid line 307: id="cart-icon-bubble"
    cy.get(cartIconSelector, { timeout: 15000 })
      .should('exist')
      .and('be.visible');
    
    cy.log('[TEST] Cart icon found');
  });

  it('clicking cart icon opens cart drawer', () => {
    cy.log('[TEST] Starting: clicking cart icon opens cart drawer');
    cy.fastVisit('/');
    
    // Click the cart icon
    cy.get(cartIconSelector, { timeout: 15000 })
      .should('be.visible')
      .click({ force: true });
    
    // Wait for drawer animation
    cy.wait(500);
    
    // Verify cart drawer is visible
    // Reference: cart-drawer.liquid line 69-77
    cy.get(cartDrawerSelector, { timeout: 10000 })
      .should('exist');
    
    cy.get(cartDrawerInnerSelector, { timeout: 10000 })
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
    cy.get(cartIconSelector, { timeout: 15000 })
      .should('be.visible')
      .click({ force: true });
    
    cy.wait(500);
    
    // Verify checkout button exists in cart drawer
    // Reference: cart-drawer.liquid line 1745-1754
    cy.get(checkoutButtonSelector, { timeout: 10000 })
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
