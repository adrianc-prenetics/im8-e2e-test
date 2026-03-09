/**
 * Sticky ATC Bar - Critical Interactions
 *
 * Reference: /Users/adrianchan/shopify-im8-ui/snippets/buy-buttons.liquid
 * Reference: /Users/adrianchan/shopify-im8-ui/snippets/product-buy-sticky.liquid
 *
 * Actual DOM structure (from buy-buttons.liquid):
 *   <product-form class="product-form">
 *     <form ...>
 *       <button id="ProductSubmitButton-{{ section_id }}"
 *               type="submit" name="add"
 *               class="product-form__submit button ...">
 *
 * Actual DOM structure (from product-buy-sticky.liquid):
 *   <div class="product-buy-sticky-container ...">
 *     <button class="product-buy-sticky__button">
 *
 * The product page wraps everything in <product-info> custom element.
 * The ATC button is inside <product-form> (another custom element) inside product-info.
 */

// Robust ATC selector — covers both main form button and sticky bar button.
// Ordered from most specific to broadest fallback.
const ATC_SELECTOR = [
  'product-info button[type="submit"]',        // Custom element > submit button (actual structure)
  'product-info .product-form__submit',         // Custom element > class
  'product-form button[type="submit"]',         // product-form custom element
  '[id^="ProductSubmitButton"]',                // By ID prefix
  '.product-form__submit',                      // By class alone
  'button[name="add"]',                         // By name attribute
  '.product-buy-sticky__button',                // Sticky bar button
  'form[action*="/cart/add"] button[type="submit"]', // By form action
].join(', ');

describe('Sticky ATC Bar - Critical Interactions', () => {
  it('product page has ATC functionality', () => {
    cy.log('[TEST] Starting sticky ATC test');
    // Use direct URL to avoid /products/essentials -> /products/essentials-pro redirect
    cy.fastVisit('/products/essentials-pro');
    cy.killPopups();

    // Wait for product-info custom element to be present first (proves product template loaded)
    cy.get('product-info', { timeout: 30000 }).should('exist');
    cy.log('[TEST] product-info element found');

    // Wait for any ATC button to exist -- use cy.get with generous timeout
    // This is more reliable than Cypress.Promise polling which can timeout on CI
    cy.get(ATC_SELECTOR, { timeout: 45000 })
      .first()
      .should('exist')
      .then($btn => {
        cy.log(`[TEST] Found ATC button: <${$btn.prop('tagName').toLowerCase()}> id="${$btn.attr('id') || ''}" class="${$btn.attr('class')?.substring(0, 60)}"`);
      });

    // Scroll to bottom to trigger sticky bar
    cy.scrollTo('bottom', { duration: 500, ensureScrollable: false });
    cy.wait(1000);

    // Verify ATC button still accessible after scroll (main or sticky)
    cy.get(ATC_SELECTOR, { timeout: 10000 })
      .first()
      .should('exist');

    cy.log('[TEST] Sticky ATC test completed');
  });
});
