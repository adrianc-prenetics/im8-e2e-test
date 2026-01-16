// ***********************************************************
// This file is processed and loaded automatically before your test files.
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Ignore uncaught exceptions from third-party scripts
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore common third-party script errors
  const ignoredErrors = [
    'gtag',
    'fbq',
    'klaviyo',
    'skio',
    'Script error',
    'ResizeObserver loop',
    'Non-Error promise rejection',
    'Cannot read properties of undefined',
    'Cannot read properties of null',
    'ChunkLoadError',
    'Loading chunk',
    'Network Error',
    'timeout',
    'Shopify',
    'analytics',
    'tracking',
  ];

  const errorMessage = err.message || err.toString();
  
  // Return false to prevent Cypress from failing the test
  if (ignoredErrors.some(ignored => errorMessage.toLowerCase().includes(ignored.toLowerCase()))) {
    return false;
  }

  // Let other errors fail the test
  return true;
});

// Log test start
beforeEach(() => {
  cy.log(`**Starting test:** ${Cypress.currentTest.title}`);
});

// Log test completion
afterEach(() => {
  cy.log(`**Completed test:** ${Cypress.currentTest.title}`);
});

// Global before hook
before(() => {
  cy.log('**Test Suite Started**');
});

// Global after hook
after(() => {
  cy.log('**Test Suite Completed**');
});
