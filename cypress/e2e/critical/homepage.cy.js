describe('Homepage - Critical Interactions', () => {
  beforeEach(() => {
    cy.fastVisit('/');
  });

  it('homepage loads successfully', () => {
    cy.get('body').should('be.visible');
    cy.get('header').should('exist');
  });

  it('can navigate to a product from homepage', () => {
    // Find and click a product link
    cy.get('a[href*="/products/"]').first().click({ force: true });
    cy.wait(1000);
    
    // Verify we're on a product page
    cy.url().should('include', '/products/');
    cy.get('.product-form__submit, button[name="add"], [class*="add-to-cart"]').should('exist');
  });

  it('footer is present', () => {
    cy.scrollTo('bottom');
    cy.get('footer').should('exist');
  });
});
