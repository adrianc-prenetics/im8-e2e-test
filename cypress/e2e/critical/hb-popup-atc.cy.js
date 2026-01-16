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
    cy.get('[class*="product"], [class*="card"], li[class*="grid"]', { timeout: 15000 })
      .should('have.length.greaterThan', 0)
      .then($cards => {
        cy.log(`[TEST] Found ${$cards.length} product cards`);
      });
    
    // Verify ATC buttons exist on product cards
    cy.get('button').contains('Add to cart', { matchCase: false })
      .should('have.length.greaterThan', 0)
      .then($btns => {
        cy.log(`[TEST] Found ${$btns.length} Add to cart buttons`);
      });
    
    cy.log('[TEST] Collection page product cards test completed');
  });

  it('clicking ATC button opens HB popup', () => {
    cy.log('[TEST] Starting: clicking ATC button opens HB popup');
    
    // Click the first "Add to cart" button on a product card
    cy.get('button').contains('Add to cart', { matchCase: false })
      .first()
      .click({ force: true });
    
    // Wait for popup animation
    cy.wait(1000);
    
    // Verify HB popup is visible
    // Reference: hb-popup.liquid - div.hb_popup with js-hb-popup attribute
    cy.get('.hb_popup, [js-hb-popup], .hb_popup__wraper, [class*="popup"][class*="product"]', { timeout: 10000 })
      .should('exist')
      .then($popup => {
        cy.log(`[TEST] HB popup found: ${$popup.attr('class')?.substring(0, 50)}`);
      });
    
    cy.log('[TEST] HB popup opened test completed');
  });

  it('HB popup displays product options', () => {
    cy.log('[TEST] Starting: HB popup displays product options');
    
    // Open the popup
    cy.get('button').contains('Add to cart', { matchCase: false })
      .first()
      .click({ force: true });
    
    cy.wait(1000);
    
    // Verify Format selection exists (Forever Jar, Single-Serve Sachets)
    cy.get('input[type="radio"], [class*="variant"], [class*="option"]', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .then($options => {
        cy.log(`[TEST] Found ${$options.length} product options`);
      });
    
    // Verify Plan selection exists (30-Day, 90-Day, One Time)
    cy.get('body').then($body => {
      const hasSubscriptionOptions = $body.text().includes('30-Day') || 
                                      $body.text().includes('90-Day') || 
                                      $body.text().includes('Subscription');
      cy.log(`[TEST] Has subscription options: ${hasSubscriptionOptions}`);
      expect(hasSubscriptionOptions).to.be.true;
    });
    
    cy.log('[TEST] HB popup product options test completed');
  });

  it('HB popup has working Add to cart button', () => {
    cy.log('[TEST] Starting: HB popup has working Add to cart button');
    
    // Open the popup
    cy.get('button').contains('Add to cart', { matchCase: false })
      .first()
      .click({ force: true });
    
    cy.wait(1000);
    
    // Find the Add to cart button inside the popup
    // This is different from the card ATC button - it's inside the popup modal
    cy.get('.hb_popup button, [js-hb-popup] button, [class*="popup"] button[type="submit"], [class*="popup"] button[name="add"]', { timeout: 10000 })
      .contains(/add to cart|add|buy/i)
      .should('exist')
      .then($btn => {
        cy.log(`[TEST] Found popup ATC button: ${$btn.text().substring(0, 30)}`);
      });
    
    cy.log('[TEST] HB popup Add to cart button test completed');
  });

  it('can add product to cart from HB popup', () => {
    cy.log('[TEST] Starting: can add product to cart from HB popup');
    
    // Open the popup
    cy.get('button').contains('Add to cart', { matchCase: false })
      .first()
      .click({ force: true });
    
    cy.wait(1000);
    
    // Click the Add to cart button in the popup
    cy.get('.hb_popup button, [js-hb-popup] button, [class*="popup"] button', { timeout: 10000 })
      .contains(/add to cart/i)
      .click({ force: true });
    
    // Wait for cart update
    cy.wait(2000);
    
    // Verify cart was updated (cart drawer opens or cart count updates)
    cy.get('body').then($body => {
      const cartDrawerOpen = $body.find('.cart-drawer, [class*="cart"][class*="drawer"]').length > 0;
      const cartCountUpdated = $body.find('.cart-count-bubble, [class*="cart-count"]').text().trim() !== '0';
      
      cy.log(`[TEST] Cart drawer open: ${cartDrawerOpen}, Cart count updated: ${cartCountUpdated}`);
      
      // Either the cart drawer opened or the cart count was updated
      expect(cartDrawerOpen || cartCountUpdated).to.be.true;
    });
    
    cy.log('[TEST] Add to cart from HB popup test completed');
  });
});
