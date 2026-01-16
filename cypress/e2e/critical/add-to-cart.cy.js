describe('Add to Cart - Critical Interactions', () => {
  beforeEach(() => {
    cy.fastVisit('/products/essentials');
  });

  it('ATC button is visible and clickable', () => {
    cy.scrollToProductForm();
    cy.get('.product-form__submit, button[name="add"]')
      .first()
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('clicking ATC opens cart drawer or updates cart', () => {
    cy.forceAddToCart();
    cy.wait(2000);
    
    // Verify cart drawer opened OR cart count appeared
    cy.get('body').then($body => {
      const drawerVisible = $body.find('#CartDrawer[open], cart-drawer[open], #CartDrawer.is-open, .cart-drawer--open').length > 0 ||
                           $body.find('#CartDrawer').is(':visible');
      const cartCountVisible = $body.find('.cart-count-bubble:visible').length > 0;
      
      // At least one should be true
      expect(drawerVisible || cartCountVisible, 'Cart drawer should open or cart count should appear').to.be.true;
    });
  });

  it('product appears in cart after adding', () => {
    cy.forceAddToCart();
    cy.wait(2000);
    
    // Open cart if drawer didn't auto-open
    cy.get('body').then($body => {
      if (!$body.find('#CartDrawer:visible').length) {
        cy.get('#cart-icon-bubble').click({ force: true });
        cy.wait(1000);
      }
    });
    
    // Verify cart has items (not empty)
    cy.get('#CartDrawer, cart-drawer, .cart-drawer').then($drawer => {
      const hasItems = $drawer.find('.cart-item, [class*="cart-item"], [class*="line-item"]').length > 0;
      const hasEmptyMessage = $drawer.find(':contains("empty")').length > 0 && $drawer.find('.cart-item').length === 0;
      
      expect(hasItems, 'Cart should contain the added product').to.be.true;
    });
  });
});
