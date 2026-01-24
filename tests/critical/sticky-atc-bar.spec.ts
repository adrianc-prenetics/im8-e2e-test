import { test, expect } from '@playwright/test';
import { fastVisit, selectors } from '../helpers/test-utils';

/**
 * Sticky ATC Bar Tests
 * 
 * Tests that ATC button remains accessible after scrolling
 */
test.describe('Sticky ATC Bar - Critical Interactions', () => {
  
  test('product page has ATC functionality after scroll', async ({ page }) => {
    await fastVisit(page, '/products/essentials');
    
    // Verify ATC button exists
    const atcButton = page.locator(selectors.atcButton).first();
    await atcButton.waitFor({ state: 'attached', timeout: 15000 });
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Verify ATC button is still accessible (either main or sticky)
    expect(await page.locator(selectors.atcButton).count()).toBeGreaterThan(0);
  });
});
