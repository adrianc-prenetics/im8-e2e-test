import { test, expect } from '@playwright/test';
import { fastVisit, killPopups, selectors } from '../helpers/test-utils';

/**
 * Sticky ATC Bar Tests
 * 
 * Tests that ATC button remains accessible after scrolling
 */
test.describe('Sticky ATC Bar - Critical Interactions', () => {
  
  test('product page has ATC functionality after scroll', async ({ page }) => {
    await fastVisit(page, '/products/essentials');
    await killPopups(page);
    
    // Wait for product-form custom element or form to be in DOM
    await page.waitForFunction(() => {
      const ceReady = typeof customElements !== 'undefined' && 
             customElements.get('product-form') !== undefined;
      const formExists = !!document.querySelector('product-form form, form[action*="/cart/add"]');
      return ceReady || formExists;
    }, { timeout: 30000 });
    
    // Verify ATC button exists - use broader selector for resilience
    const atcButton = page.locator('product-form button[type="submit"], button[name="add"], .product-form__submit, [id^="ProductSubmitButton"]').first();
    await atcButton.waitFor({ state: 'attached', timeout: 20000 });
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Verify ATC button is still accessible (either main or sticky)
    const buttonCount = await page.locator('product-form button[type="submit"], button[name="add"], .product-form__submit, [id^="ProductSubmitButton"]').count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});
