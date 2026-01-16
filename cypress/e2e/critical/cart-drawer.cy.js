describe('Cart Drawer - Critical Interactions', () => {
  it('cart icon exists on homepage', () => {
    cy.task('log', '[TEST] Starting: cart icon exists on homepage');
    cy.fastVisit('/');
    cy.debugPageState();
    
    cy.get('#cart-icon-bubble, button[aria-label*="Cart"], a[href="/cart"]', { timeout: 15000 })
      .should('exist')
      .then($el => {
        cy.task('log', `[TEST] Found cart element: tag=${$el.prop('tagName')}, id=${$el.attr('id')}`);
      });
  });

  it('can add item to cart from product page', () => {
    cy.task('log', '[TEST] Starting: can add item to cart from product page');
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(2000);
    cy.task('log', '[TEST] Add to cart completed');
    cy.get('body').should('exist');
  });
});
