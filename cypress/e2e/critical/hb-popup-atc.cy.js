/**
 * HB Popup Add to Cart Tests
 * 
 * Tests the quick-add popup functionality on collection pages:
 * - Clicking "Add to cart" on product cards opens the HB popup
 * - HB popup displays product options (Format, Plan)
 * - HB popup has a working Add to cart button
 * 
 * Reference: /Users/adrianchan/shopify-im8-ui/snippets/hb-popup.liquid
 * The popup is triggered on collection pages when clicking product card ATC buttons
 */
describe('HB Popup Add to Cart - Critical Interactions', () => {
  beforeEach(() => {
    cy.fastVisit('/collections/all');
  });

  it('collection page has product cards with ATC buttons', () => {
    cy.log('[TEST] Starting: collection page has product cards with ATC buttons');
    
    // Verify product cards exist
    // Based on shopify-im8-ui/snippets/card-product.liquid: .Card_product_main_new
    cy.get('.Card_product_main_new, .card-wrapper, [class*="product-card"]', { timeout: 15000 })
      .should('have.length.greaterThan', 0)
      .then($cards => {
        cy.log(`[TEST] Found ${$cards.length} product cards`);
      });
    
    // Verify quick-add ATC buttons exist on product cards
    // Based on shopify-im8-ui/snippets/card-product.liquid: [quick-add__submit] attribute
    cy.get('[quick-add__submit], .quick-add__submit', { timeout: 15000 })
      .should('have.length.greaterThan', 0)
      .then($btns => {
        cy.log(`[TEST] Found ${$btns.length} quick-add buttons`);
      });
    
    cy.log('[TEST] Collection page product cards test completed');
  });

  it('clicking ATC button opens HB popup', () => {
    cy.log('[TEST] Starting: clicking ATC button opens HB popup');
    
    // Click the first quick-add button on a product card
    // Based on shopify-im8-ui/snippets/card-product.liquid: [quick-add__submit] attribute
    cy.get('[quick-add__submit], .quick-add__submit', { timeout: 15000 })
      .first()
      .click({ force: true });
    
    // Wait for popup to load via AJAX
    cy.wait(1000);
    
    // Verify HB popup is visible and active
    // Based on shopify-im8-ui/snippets/hb-popup.liquid and global.js
    cy.get('[js-hb-popup].active, .hb_popup.active', { timeout: 10000 })
      .should('exist')
      .then($popup => {
        cy.log(`[TEST] HB popup found: ${$popup.attr('class')?.substring(0, 50)}`);
      });
    
    cy.log('[TEST] HB popup opened test completed');
  });

  it('HB popup displays product options', () => {
    cy.log('[TEST] Starting: HB popup displays product options');
    
    // Wait for quick-add buttons to load on collection page
    // Based on shopify-im8-ui/snippets/card-product.liquid: [quick-add__submit] attribute
    cy.get('[quick-add__submit], .quick-add__submit', { timeout: 15000 })
      .first()
      .click({ force: true });
    
    // Wait for popup to load via AJAX (fetches /products/{handle}?view=hb-popup-ajax)
    cy.wait(1500);
    
    // Verify HB popup is active and has content
    // Based on shopify-im8-ui/snippets/hb-popup.liquid: [js-hb-popup] with .active class
    cy.get('[js-hb-popup].active, .hb_popup.active', { timeout: 10000 })
      .should('exist');
    
    // Verify variant options exist in popup
    // Based on shopify-im8-ui/templates/product.hb-popup-ajax.liquid
    cy.get('[js-hb-popup] input[type="radio"], [js-product-detail] input[type="radio"], .hb_popup input[type="radio"]', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .then($options => {
        cy.log(`[TEST] Found ${$options.length} product options`);
      });
    
    cy.log('[TEST] HB popup product options test completed');
  });

  it('HB popup has working Add to cart button', () => {
    cy.log('[TEST] Starting: HB popup has working Add to cart button');
    
    // Open the popup using quick-add button
    cy.get('[quick-add__submit], .quick-add__submit', { timeout: 15000 })
      .first()
      .click({ force: true });
    
    // Wait for popup to load via AJAX
    cy.wait(1500);
    
    // Find the Add to cart button inside the HB popup
    // Based on shopify-im8-ui/templates/product.hb-popup-ajax.liquid: #ProductSubmitButton-hb-popup-ajax
    cy.get('#ProductSubmitButton-hb-popup-ajax, [js-hb-popup] button[name="add"], .hb_popup__atc button', { timeout: 10000 })
      .should('exist')
      .then($btn => {
        cy.log(`[TEST] Found popup ATC button: ${$btn.text().substring(0, 30)}`);
      });
    
    cy.log('[TEST] HB popup Add to cart button test completed');
  });

  it('can add product to cart from HB popup', () => {
    cy.log('[TEST] Starting: can add product to cart from HB popup');
    
    // Open the popup using quick-add button
    cy.get('[quick-add__submit], .quick-add__submit', { timeout: 15000 })
      .first()
      .click({ force: true });
    
    // Wait for popup to load via AJAX
    cy.wait(1500);
    
    // Click the Add to cart button in the HB popup
    // Based on shopify-im8-ui/templates/product.hb-popup-ajax.liquid: #ProductSubmitButton-hb-popup-ajax
    cy.get('#ProductSubmitButton-hb-popup-ajax, [js-hb-popup] button[name="add"], .hb_popup__atc button', { timeout: 10000 })
      .first()
      .click({ force: true });
    
    // Wait for cart update
    cy.wait(2000);
    
    // Verify cart was updated (cart drawer opens or cart count updates)
    cy.get('body').then($body => {
      const cartDrawerOpen = $body.find('cart-drawer.active, .cart-drawer.active').length > 0;
      const cartCountUpdated = $body.find('.cart-count-bubble, [class*="cart-count"]').text().trim() !== '0';
      
      cy.log(`[TEST] Cart drawer open: ${cartDrawerOpen}, Cart count updated: ${cartCountUpdated}`);
      
      // Either the cart drawer opened or the cart count was updated
      expect(cartDrawerOpen || cartCountUpdated).to.be.true;
    });
    
    cy.log('[TEST] Add to cart from HB popup test completed');
  });
});
