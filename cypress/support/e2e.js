// Global E2E support file
import './commands';

// Ignore ALL uncaught exceptions from the app - we're testing UI, not their JS
Cypress.on('uncaught:exception', () => false);

// Log test names
beforeEach(function() {
  cy.log(`Running: ${this.currentTest.title}`);
});
