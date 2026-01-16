// Global E2E support file
import './commands';

// Ignore ALL uncaught exceptions from the app
Cypress.on('uncaught:exception', () => false);

// Before each test, try to dismiss popups
beforeEach(() => {
  // Will be called after cy.visit in tests
});
