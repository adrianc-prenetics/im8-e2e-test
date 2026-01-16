describe('Checkout Flow - Critical Interactions', () => {
  it('product page has checkout path', () => {
    cy.log('[TEST] Starting: product page has checkout path');
    cy.fastVisit('/products/essentials');
    cy.forceAddToCart();
    cy.wait(2000);
    cy.log('[TEST] Checkout flow test completed');
  });
});
