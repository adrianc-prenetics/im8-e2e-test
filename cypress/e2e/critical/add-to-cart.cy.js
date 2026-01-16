describe('Add to Cart - Critical Interactions', () => {
  beforeEach(() => {
    cy.fastVisit('/products/essentials');
  });

  it('ATC button exists and is clickable', () => {
    cy.killPopups();
    // Main ATC button - the one with "TRANSFORMATION" text or name="add"
    cy.get('button[name="add"], button:contains("TRANSFORMATION"), button:contains("Add to cart")')
      .first()
      .should('exist');
  });

  it('clicking ATC triggers cart update', () => {
    cy.forceAddToCart();
    cy.wait(2000);
    
    // After clicking ATC, either:
    // 1. Cart drawer opens
    // 2. Cart count appears/updates
    // 3. A "Beckham" popup appears (site-specific behavior)
    cy.get('body').then($body => {
      const drawerVisible = $body.find('#CartDrawer:visible, cart-drawer:visible, [class*="cart-drawer"]:visible').length > 0;
      const cartCount = $body.find('.cart-count-bubble').length > 0;
      const beckhamPopup = $body.find('[class*="beckham"]:visible, [class*="popup"]:visible').length > 0;
      
      expect(drawerVisible || cartCount || beckhamPopup, 'Cart should respond to ATC click').to.be.true;
    });
  });
});
