describe('Cart Drawer - Critical Interactions', () => {
  it('cart icon exists on homepage', () => {
    cy.log('[TEST] Starting: cart icon exists on homepage');
    cy.fastVisit('/');
    
    // Cart icon should exist - using button with Cart aria-label based on live site
    cy.get('button[aria-label*="Cart"], #cart-icon-bubble, a[href="/cart"]', { timeout: 15000 })
      .first()
      .should('exist');
    
    cy.log('[TEST] Cart icon found');
  });

  it('can add item to cart from product page', () => {
    cy.log('[TEST] Starting: can add item to cart from product page');
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(2000);
    cy.log('[TEST] Add to cart completed');
  });
});
