const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://im8health.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    
    // Timeouts - collection pages can be slow
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 30000,
    requestTimeout: 8000,
    responseTimeout: 10000,
    
    // Viewport
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // No video, screenshots only on failure
    video: false,
    screenshotOnRunFailure: true,
    
    // NO retries - fail fast
    retries: {
      runMode: 0,
      openMode: 0,
    },
    
    experimentalRunAllSpecs: true,
    
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
      return config;
    },
  },
});
