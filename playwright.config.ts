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
  
  /* Limit parallel workers to avoid overwhelming the site */
  workers: process.env.CI ? 2 : 1,
  
  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  
  /* Shared settings for all projects */
  use: {
    /* Base URL for all tests */
    baseURL: 'https://im8health.com',
    
    /* Collect trace on failure */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'on-first-retry',
    
    /* Default timeout for actions - increased for reliability */
    actionTimeout: 20000,
    
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
      },
    },
    {
      name: 'mobile',
      use: { 
        ...devices['iPhone 13'],
      },
    },
  ],
});
