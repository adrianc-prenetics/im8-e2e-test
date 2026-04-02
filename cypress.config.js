const { defineConfig } = require('cypress');

module.exports = defineConfig({
  // Real Chrome user agent — prevents Cloudflare from detecting HeadlessChrome
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',

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
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // Prevent navigator.webdriver=true — another Cloudflare bot signal
          launchOptions.args.push('--disable-blink-features=AutomationControlled');
        }
        return launchOptions;
      });

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
