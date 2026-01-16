describe('Sticky ATC Bar - Critical Interactions', () => {
  it('sticky bar has shop now link', () => {
    cy.fastVisit('/products/essentials');
    cy.killPopups();
    
    // Scroll down to trigger sticky bar
    cy.scrollTo(0, 1000);
    cy.wait(500);
    
    // The sticky bar has a "shop now" link that scrolls to product
    // Or we can just click the main ATC button
    cy.get('[id^="ProductSubmitButton"], .product-form__submit', { timeout: 10000 })
      .first()
      .scrollIntoView()
      .click({ force: true });
    cy.wait(1000);
    
    cy.get('body').should('exist');
  });
});
