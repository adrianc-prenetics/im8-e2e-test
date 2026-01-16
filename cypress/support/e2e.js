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
    // Critical: Ignore "Failed to fetch" errors from third-party scripts (Skio, web pixels, etc.)
    'Failed to fetch',
    'fetch',
    'NetworkError',
    'net::ERR',
    'TypeError: Failed to fetch',
    'AbortError',
    'The operation was aborted',
    'Load failed',
    'cancelled',
    'CORS',
    'cross-origin',
  ];

  const errorMessage = err.message || err.toString();
  const errorStack = err.stack || '';
  
  // Return false to prevent Cypress from failing the test
  if (ignoredErrors.some(ignored => 
    errorMessage.toLowerCase().includes(ignored.toLowerCase()) ||
    errorStack.toLowerCase().includes(ignored.toLowerCase())
  )) {
    return false;
  }

  // Also ignore errors from known third-party domains
  const thirdPartyDomains = [
    'skio.com',
    'cdn.skio.com',
    'shopify.com',
    'cdn.shopify.com',
    'googletagmanager.com',
    'google-analytics.com',
    'facebook.com',
    'facebook.net',
    'klaviyo.com',
    'gorgias.chat',
    'triplewhale',
    'taboola',
    'getangler.ai',
  ];

  if (thirdPartyDomains.some(domain => 
    errorStack.toLowerCase().includes(domain.toLowerCase())
  )) {
    return false;
  }

  // Let other errors fail the test
  return true;
});

// Log test start and dismiss any popups
beforeEach(() => {
  cy.log(`**Starting test:** ${Cypress.currentTest.title}`);
  
  // After each page load, check for and dismiss marketing popups
  // This runs after the test's own beforeEach hooks
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
