import { test, expect } from '@playwright/test';
import { fastVisit } from '../helpers/test-utils';

test.describe('Homepage - Critical Interactions', () => {

  test('homepage loads with product links', async ({ page }) => {
    await fastVisit(page, '/');

    await expect(page).toHaveURL(/im8health\.com/);
    const productLinks = page.locator('a[href*="/products/"]');
    await productLinks.first().waitFor({ state: 'attached', timeout: 10000 });
    expect(await productLinks.count()).toBeGreaterThan(0);
  });
});
