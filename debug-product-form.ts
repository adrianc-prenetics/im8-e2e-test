import { chromium } from '@playwright/test';

async function debugProductForm() {
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
  
  console.log('Navigating to /products/essentials...');
  await page.goto('https://im8health.com/products/essentials', { waitUntil: 'load', timeout: 60000 });
  
  console.log('Page loaded. Checking form...');
  
  // Check form structure
  const formInfo = await page.evaluate(() => {
    const productForm = document.querySelector('product-form');
    const form = document.querySelector('product-form form');
    const variantInput = form?.querySelector('input[name="id"]') as HTMLInputElement;
    const button = document.querySelector('product-form button[type="submit"][name="add"]');
    
    return {
      hasProductForm: !!productForm,
      hasForm: !!form,
      formSelector: form ? 'product-form form' : null,
      variantId: variantInput?.value || null,
      hasButton: !!button,
      buttonAriaDisabled: button?.getAttribute('aria-disabled'),
      buttonText: button?.textContent?.trim().slice(0, 50),
    };
  });
  
  console.log('Form info:', formInfo);
  
  // Try the API call
  console.log('\nTrying direct API call...');
  const apiResult = await page.evaluate(async () => {
    const form = document.querySelector('product-form form') as HTMLFormElement;
    if (!form) return { error: 'No form found' };
    
    const variantInput = form.querySelector('input[name="id"]') as HTMLInputElement;
    if (!variantInput?.value) return { error: 'No variant ID' };
    
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          id: parseInt(variantInput.value, 10),
          quantity: 1,
        }),
      });
      
      const data = await response.json();
      return {
        ok: response.ok,
        status: response.status,
        data: data,
      };
    } catch (e: any) {
      return { error: e.message };
    }
  });
  
  console.log('API result:', JSON.stringify(apiResult, null, 2));
  
  // Check cart drawer
  const drawerInfo = await page.evaluate(() => {
    const drawer = document.querySelector('cart-drawer') as any;
    return {
      exists: !!drawer,
      hasOpenMethod: drawer && typeof drawer.open === 'function',
      classes: drawer?.className,
    };
  });
  
  console.log('Drawer info:', drawerInfo);
  
  await browser.close();
}

debugProductForm().catch(console.error);
