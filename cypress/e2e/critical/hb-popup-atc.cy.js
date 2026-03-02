/**
 * HB Popup Add to Cart Tests
 *
 * Tests the quick-add popup functionality on collection pages:
 * - Clicking "Add to cart" on product cards opens the HB popup
 * - HB popup displays product options (Format, Plan)
 * - HB popup has a working Add to cart button
 *
 * Reference: /Users/adrianchan/shopify-im8-ui/snippets/hb-popup.liquid
 * The popup is triggered on collection pages when clicking product card ATC buttons.
 * Products without options (vegan-travel-pouch, etc.) skip the popup entirely.
 */
describe('HB Popup Add to Cart - Critical Interactions', () => {
  beforeEach(() => {
    cy.fastVisit('/collections/all');
    // Intercept HB popup AJAX requests so we can wait on them
    cy.intercept('GET', '**/products/*?view=hb-popup-ajax*').as('hbPopupAjax');
  });

  /**
   * Helper: click first quick-add button that opens a popup (skip no-options products)
   * and wait for the AJAX response + popup active state.
   */
  const openHbPopup = () => {
    const noOptionsProducts = ['embroidered-cap', 'vegan-travel-pouch', 'signature-cup'];

    cy.get('[quick-add__submit], .quick-add__submit', { timeout: 15000 }).then($btns => {
      // Find first visible button for a product with options
      let targetBtn = null;
      $btns.each((i, btn) => {
        if (targetBtn) return;
        const handle = btn.getAttribute('data-product-handle');
        if (handle && !noOptionsProducts.includes(handle) && btn.offsetHeight > 0) {
          targetBtn = btn;
        }
      });
      // Fallback to first visible button
      if (!targetBtn) targetBtn = $btns.filter(':visible').first()[0];
      cy.wrap(targetBtn).scrollIntoView().click({ force: true });
    });

    // Wait for AJAX response (popup content fetched)
    cy.wait('@hbPopupAjax', { timeout: 25000 });

    // Wait for popup to become active
    cy.get('[js-hb-popup].active, .hb_popup.active', { timeout: 15000 })
      .should('exist');

    // Wait for popup content to render (ATC button present)
    cy.get('#ProductSubmitButton-hb-popup-ajax', { timeout: 10000 })
      .should('exist');
  };

  it('collection page has product cards with ATC buttons', () => {
    cy.log('[TEST] Starting: collection page has product cards with ATC buttons');

    cy.get('.Card_product_main_new, .card-wrapper, [class*="product-card"]', { timeout: 15000 })
      .should('have.length.greaterThan', 0);

    cy.get('[quick-add__submit], .quick-add__submit', { timeout: 15000 })
      .should('have.length.greaterThan', 0);

    cy.log('[TEST] Collection page product cards test completed');
  });

  it('clicking ATC button opens HB popup', () => {
    cy.log('[TEST] Starting: clicking ATC button opens HB popup');

    openHbPopup();

    cy.get('[js-hb-popup].active, .hb_popup.active', { timeout: 10000 })
      .should('exist');

    cy.log('[TEST] HB popup opened test completed');
  });

  it('HB popup displays product options', () => {
    cy.log('[TEST] Starting: HB popup displays product options');

    openHbPopup();

    cy.get('[js-hb-popup] input[type="radio"], [js-product-detail] input[type="radio"], .hb_popup input[type="radio"]', { timeout: 15000 })
      .should('have.length.greaterThan', 0);

    cy.log('[TEST] HB popup product options test completed');
  });

  it('HB popup has working Add to cart button', () => {
    cy.log('[TEST] Starting: HB popup has working Add to cart button');

    openHbPopup();

    cy.get('#ProductSubmitButton-hb-popup-ajax, [js-hb-popup] button[name="add"], .hb_popup__atc button', { timeout: 10000 })
      .should('exist');

    cy.log('[TEST] HB popup Add to cart button test completed');
  });

  it('can add product to cart from HB popup', () => {
    cy.log('[TEST] Starting: can add product to cart from HB popup');

    openHbPopup();

    // Click the Add to cart button in the HB popup
    cy.get('#ProductSubmitButton-hb-popup-ajax, [js-hb-popup] button[name="add"], .hb_popup__atc button', { timeout: 10000 })
      .first()
      .click({ force: true });

    // Wait for cart update
    cy.wait(3000);

    // Verify cart was updated (cart drawer opens or cart count updates)
    cy.get('body').then($body => {
      const $drawer = $body.find('cart-drawer');
      const hasAnimate = $drawer.hasClass('animate');
      const hasActive = $drawer.hasClass('active');
      const hasOpening = $drawer.hasClass('opening');
      const cartDrawerOpen = hasAnimate || hasActive || hasOpening;
      const cartCountUpdated = $body.find('.cart-count-bubble, [class*="cart-count"]').text().trim() !== '0';

      cy.log(`[TEST] Cart drawer open: ${cartDrawerOpen}, Cart count updated: ${cartCountUpdated}`);

      expect(cartDrawerOpen || cartCountUpdated).to.be.true;
    });

    cy.log('[TEST] Add to cart from HB popup test completed');
  });
});
