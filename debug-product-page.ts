import { chromium } from '@playwright/test';

async function debugProductPage() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
  });
  const page = await context.newPage();
  
  // Set US market cookies
  await context.addCookies([
    { name: 'localization', value: 'US', domain: 'im8health.com', path: '/' },
    { name: 'cart_currency', value: 'USD', domain: 'im8health.com', path: '/' },
  ]);
  
  // Block Klaviyo
  await page.route('**/*klaviyo*', route => route.abort());
  
  // FIRST: Visit homepage to establish market
  console.log('Step 1: Visiting homepage to establish market...');
  await page.goto('https://im8health.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  // Accept cookies
  const acceptButton = page.locator('button').filter({ hasText: /accept/i }).first();
  if (await acceptButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await acceptButton.click({ force: true });
  }
  
  console.log('Homepage URL:', page.url());
  
  // THEN: Navigate to product page
  console.log('\nStep 2: Navigating to /products/essentials...');
  await page.goto('https://im8health.com/products/essentials', { waitUntil: 'load', timeout: 60000 });
  
  // Wait for page to stabilize
  await page.waitForTimeout(2000);
  
  console.log('Product page URL:', page.url());
  console.log('Page title:', await page.title());
  
  // Check for any forms
  const forms = await page.evaluate(() => {
    const allForms = document.querySelectorAll('form');
    return Array.from(allForms).map(f => ({
      id: f.id,
      action: f.action,
      hasVariantInput: !!f.querySelector('input[name="id"]'),
      hasAddButton: !!f.querySelector('button[name="add"]'),
    }));
  });
  
  console.log('\nForms on page:', forms);
  
  // Check for any ATC buttons
  const buttons = await page.evaluate(() => {
    const btns = document.querySelectorAll('button[name="add"], [id*="ProductSubmitButton"], .product-form__submit');
    return Array.from(btns).map(b => ({
      id: b.id,
      name: b.getAttribute('name'),
      text: b.textContent?.trim().slice(0, 50),
      className: b.className,
    }));
  });
  
  console.log('\nATC buttons:', buttons);
  
  // Check for product-form custom element
  const customElements = await page.evaluate(() => {
    return {
      productFormDefined: typeof customElements !== 'undefined' && customElements.get('product-form') !== undefined,
      productFormElements: document.querySelectorAll('product-form').length,
    };
  });
  
  console.log('\nCustom elements:', customElements);
  
  // Take screenshot
  await page.screenshot({ path: 'debug-product-page.png', fullPage: false });
  console.log('\nScreenshot saved to debug-product-page.png');
  
  await browser.close();
}

debugProductPage().catch(console.error);
