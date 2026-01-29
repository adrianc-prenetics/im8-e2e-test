const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://im8health.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    
    // Timeouts - site can be slow, especially on CI
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 60000,
    requestTimeout: 15000,
    responseTimeout: 30000,
    
    // Viewport
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // No video, screenshots only on failure
    video: false,
    screenshotOnRunFailure: true,
    
    // Retry once on failure - site can be flaky
    retries: {
      runMode: 1,
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
