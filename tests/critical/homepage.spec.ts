import { test, expect } from '@playwright/test';
import { fastVisit } from '../helpers/test-utils';

/**
 * Homepage Tests
 */
test.describe('Homepage - Critical Interactions', () => {
  
  test('homepage loads', async ({ page }) => {
    await fastVisit(page, '/');
    
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/im8health\.com/);
  });

  test('has product links', async ({ page }) => {
    await fastVisit(page, '/');
    
    // Check for product links
    const productLinks = page.locator('a[href*="/products/"]');
    await productLinks.first().waitFor({ state: 'attached', timeout: 15000 });
    expect(await productLinks.count()).toBeGreaterThan(0);
  });
});
