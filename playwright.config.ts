import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for IM8 Health E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel, but tests within a file run serially */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests */
  retries: process.env.CI ? 2 : 1,

  /* Limit to 1 worker in CI to avoid rate limiting on Shopify store */
  workers: 1,

  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  /* Shared settings for all projects */
  use: {
    /* Base URL for all tests */
    baseURL: 'https://im8health.com',

    /* Shopify bot verification is sensitive to stock Playwright fingerprints. */
    launchOptions: {
      args: ['--disable-blink-features=AutomationControlled'],
    },
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },

    /* CRITICAL: Force US locale to ensure products are available
     * Some EU markets have been disabled and show empty collections
     * US/HK markets have full product availability */
    locale: 'en-US',
    timezoneId: 'America/New_York',
    geolocation: { longitude: -73.935242, latitude: 40.730610 }, // New York

    /* Collect trace on failure */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'on-first-retry',

    /* Default timeout for actions - generous for CI headless Chrome */
    actionTimeout: 30000,

    /* Default timeout for navigation */
    navigationTimeout: 45000,
  },

  /* Global timeout for each test - increased for reliability */
  timeout: 90000,

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    },
    {
      name: 'mobile',
      use: {
        // Exercise responsive mobile layout with a narrow Chromium viewport.
        // Full iPhone device emulation currently trips Shopify bot verification.
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    },
  ],
});
