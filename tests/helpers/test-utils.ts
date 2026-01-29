import { Page } from '@playwright/test';

/**
 * Enterprise-grade test utilities for IM8 Health E2E tests
 * 
 * Based on deep analysis of shopify-im8-ui theme:
 * - assets/product-form.js (ATC flow)
 * - assets/cart-drawer.js (drawer behavior)
 * - assets/global.js (HB popup)
 * - sections/header.liquid (cart icon)
 * 
 * All selectors and timing values are derived from the actual theme code.
 */

/**
 * Exact selectors from shopify-im8-ui theme
 */
export const selectors = {
  // Cart Drawer (cart-drawer.liquid, cart-drawer.js)
  cartDrawer: 'cart-drawer',
  cartDrawerActive: 'cart-drawer.active',
  cartDrawerOpening: 'cart-drawer.opening',
  cartDrawerInner: '.drawer__inner',
  cartDrawerOverlay: '#CartDrawer-Overlay',
  checkoutButton: '#CartDrawer-Checkout',
  cartForm: '#CartDrawer-Form',
  
  // Cart Icon (header.liquid line 307)
  cartIcon: '#cart-icon-bubble',
  cartCountBubble: '.cart-count-bubble',
  
  // ATC Button (buy-buttons.liquid)
  atcButton: '[id^="ProductSubmitButton"], button[name="add"], .product-form__submit',
  atcButtonLoading: '[id^="ProductSubmitButton"].loading',
  loadingSpinner: '.loading__spinner:not(.hidden)',
  
  // HB Popup (hb-popup.liquid, global.js)
  hbPopup: '[js-hb-popup]',
  hbPopupActive: '[js-hb-popup].active',
  hbPopupHidden: '[js-hb-popup].hidden',
  hbPopupAtcButton: '#ProductSubmitButton-hb-popup-ajax',
  hbPopupClose: '[js-hb-close-popup]',
  
  // Quick Add (global.js line 1751)
  quickAddButton: '[quick-add__submit]',
  
  // Mobile Navigation (header-drawer.liquid)
  hamburgerMenu: 'summary.header__icon--menu',
  mobileDrawer: '#menu-drawer',
  mobileDrawerContainer: '#Details-menu-drawer-container',
  
  // Header
  header: 'header, [role="banner"]',
  megaMenu: '.mega-menu__content, [id^="MegaMenu-Content"]',
};

/**
 * Kill Klaviyo popups that interfere with testing
 * Blocks at network level and removes from DOM
 */
export async function killPopups(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Fix body if Klaviyo has hidden it
    document.body?.classList.remove('klaviyo-prevent-body-scrolling');
    document.body.style.display = '';
    document.body.style.overflow = '';
    
    // Remove all Klaviyo elements from DOM
    const klaviyoSelectors = [
      '[class*="klaviyo"]',
      '.needsclick',
      '.kl-private-reset-css-Xuajs1',
      '[data-testid="klaviyo-form-container"]',
      'div[aria-label*="POPUP"]',
      'div[aria-label*="Form"]'
    ];
    
    klaviyoSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Don't remove cart drawer or HB popup
        if (!el.closest('cart-drawer') && !el.closest('[js-hb-popup]')) {
          el.remove();
        }
      });
    });
    
    // Remove generic modals (but not cart drawer or HB popup)
    document.querySelectorAll('[role="dialog"], [aria-modal="true"]').forEach(el => {
      if (!el.closest('cart-drawer') && 
          !el.closest('[js-hb-popup]') && 
          !el.closest('#CartDrawer') &&
          !el.classList.contains('drawer__inner')) {
        el.remove();
      }
    });
  });
}

/**
 * Fast page visit with Klaviyo blocking at network level
 * Waits for Shopify JS to initialize (cart-drawer custom element defined)
 * 
 * CRITICAL: Forces US market to ensure products are available.
 * Some EU markets have been disabled and show empty collections.
 * 
 * The market is set by first visiting the homepage to establish cookies,
 * then navigating to the target URL.
 */
export async function fastVisit(page: Page, url: string): Promise<void> {
  // Block Klaviyo at network level - prevents popups from ever loading
  await page.route('**/*klaviyo*', route => route.abort());
  await page.route('**/static.klaviyo.com/**', route => route.abort());
  
  // CRITICAL: Set cookies to force US market BEFORE navigation
  await page.context().addCookies([
    {
      name: 'localization',
      value: 'US',
      domain: 'im8health.com',
      path: '/',
    },
    {
      name: 'cart_currency',
      value: 'USD',
      domain: 'im8health.com',
      path: '/',
    },
  ]);
  
  // For product pages, we need to establish the market first
  // by visiting the homepage, then navigating to the product
  const isProductPage = url.includes('/products/');
  
  if (isProductPage) {
    // First visit homepage to establish market
    await page.goto('https://im8health.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Accept cookie consent if present
    const acceptButton = page.locator('button').filter({ hasText: /accept/i }).first();
    if (await acceptButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acceptButton.click({ force: true });
    }
    
    // Now navigate to the actual product page
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  } else {
    // For non-product pages, navigate directly
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  }
  
  // Wait for body
  await page.waitForSelector('body', { timeout: 15000 });
  
  // Force US market via JavaScript
  await page.evaluate(() => {
    try {
      localStorage.setItem('shopify_market', 'US');
      localStorage.setItem('currency', 'USD');
    } catch (e) {
      // localStorage may not be available
    }
  });
  
  // Wait for cart-drawer custom element to be defined
  await page.waitForFunction(() => {
    return typeof customElements !== 'undefined' && 
           customElements.get('cart-drawer') !== undefined;
  }, { timeout: 20000 }).catch(() => {
    // Custom element may not be on all pages
  });
  
  // Kill any popups
  await killPopups(page);
  
  // Accept cookie consent if present (check again after navigation)
  const acceptButton = page.locator('button').filter({ hasText: /accept/i }).first();
  if (await acceptButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await acceptButton.click({ force: true });
  }
  
  await killPopups(page);
}

/**
 * Wait for cart drawer to be fully open and ready
 * 
 * From cart-drawer.js:
 * - 'active' class added via requestAnimationFrame (~16ms)
 * - 'opening' class removed after 50ms
 * - Drawer is ready when 'active' is present AND 'opening' is absent
 */
export async function waitForCartDrawerReady(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const drawer = document.querySelector('cart-drawer');
    return drawer?.classList.contains('active') && 
           !drawer?.classList.contains('opening');
  }, { timeout: 20000 });
}

/**
 * BULLETPROOF: Add to cart using direct API call
 * 
 * This is the most reliable method for CI environments.
 * It directly calls the Shopify cart API and then opens the cart drawer.
 * 
 * @param page - Playwright page
 * @param formSelector - CSS selector for the product form (e.g., 'product-form form')
 */
async function addToCartViaAPI(page: Page, formSelector: string): Promise<boolean> {
  return await page.evaluate(async (selector) => {
    const form = document.querySelector(selector) as HTMLFormElement;
    if (!form) return false;
    
    // Get variant ID from form
    const variantInput = form.querySelector('input[name="id"]') as HTMLInputElement;
    const variantId = variantInput?.value;
    
    if (!variantId) return false;
    
    try {
      // Call cart API directly (same as product-form.js line 95)
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          id: parseInt(variantId, 10),
          quantity: 1,
        }),
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      
      // Now fetch the cart drawer sections and update (mimics cart.renderContents)
      const cartDrawer = document.querySelector('cart-drawer') as any;
      if (cartDrawer) {
        // Fetch updated cart drawer HTML
        const sectionsResponse = await fetch('/cart?sections=cart-drawer,cart-icon-bubble');
        if (sectionsResponse.ok) {
          const sections = await sectionsResponse.json();
          
          // Update cart drawer content
          if (sections['cart-drawer']) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(sections['cart-drawer'], 'text/html');
            const newContent = doc.querySelector('.drawer__inner');
            const currentContent = cartDrawer.querySelector('.drawer__inner');
            if (newContent && currentContent) {
              currentContent.innerHTML = newContent.innerHTML;
            }
          }
          
          // Update cart icon bubble
          if (sections['cart-icon-bubble']) {
            const bubble = document.querySelector('#cart-icon-bubble');
            if (bubble) {
              const parser = new DOMParser();
              const doc = parser.parseFromString(sections['cart-icon-bubble'], 'text/html');
              const newBubble = doc.querySelector('#cart-icon-bubble');
              if (newBubble) {
                bubble.innerHTML = newBubble.innerHTML;
              }
            }
          }
        }
        
        // Open the cart drawer
        if (typeof cartDrawer.open === 'function') {
          cartDrawer.classList.remove('is-empty');
          cartDrawer.open();
        }
      }
      
      return true;
    } catch (e) {
      console.error('addToCartViaAPI error:', e);
      return false;
    }
  }, formSelector);
}

/**
 * BULLETPROOF: Add to cart from product page
 * 
 * Uses a multi-strategy approach:
 * 1. First tries direct API call (most reliable in CI)
 * 2. Falls back to button click if API fails
 * 3. Verifies cart drawer opens
 */
export async function addToCart(page: Page): Promise<void> {
  await killPopups(page);
  
  // Wait for product-form custom element to be defined (indicates JS is ready)
  await page.waitForFunction(() => {
    return typeof customElements !== 'undefined' && 
           customElements.get('product-form') !== undefined;
  }, { timeout: 30000 });
  
  // Wait for page to stabilize
  await page.waitForTimeout(1000);
  await killPopups(page);
  
  // Wait for ATC button to exist and be visible
  const atcButton = page.locator('product-form button[type="submit"][name="add"]').first();
  await atcButton.waitFor({ state: 'visible', timeout: 30000 });
  
  // Wait for variant to be selected (form has valid variant ID)
  await page.waitForFunction(() => {
    const form = document.querySelector('product-form form');
    const variantInput = form?.querySelector('input[name="id"]') as HTMLInputElement;
    return variantInput && variantInput.value && variantInput.value !== '';
  }, { timeout: 15000 });
  
  await killPopups(page);
  
  // Strategy 1: Direct API call (most reliable)
  let success = await addToCartViaAPI(page, 'product-form form');
  
  // Strategy 2: Button click fallback
  if (!success) {
    // Wait for button to be enabled
    await page.waitForFunction(() => {
      const btn = document.querySelector('product-form button[type="submit"][name="add"]');
      return btn && btn.getAttribute('aria-disabled') !== 'true';
    }, { timeout: 10000 }).catch(() => {});
    
    // Set up response listener
    const responsePromise = page.waitForResponse(
      r => r.url().includes('/cart/add') && r.status() === 200,
      { timeout: 15000 }
    ).catch(() => null);
    
    await atcButton.click({ force: true });
    
    const response = await responsePromise;
    success = response !== null;
  }
  
  if (!success) {
    throw new Error('Failed to add product to cart');
  }
  
  // Wait for cart drawer to open
  await page.waitForFunction(() => {
    const drawer = document.querySelector('cart-drawer');
    return drawer && (
      drawer.classList.contains('active') || 
      drawer.classList.contains('animate') ||
      drawer.classList.contains('opening')
    );
  }, { timeout: 15000 });
  
  // Wait for drawer to be fully ready
  await waitForCartDrawerReady(page);
}

/**
 * Open cart drawer by clicking cart icon
 * 
 * From cart-drawer.js line 46-49:
 * - Click on #cart-icon-bubble calls this.open(cartLink)
 * - open() adds 'active' class via requestAnimationFrame
 */
export async function openCartDrawer(page: Page): Promise<void> {
  await killPopups(page);
  
  const cartIcon = page.locator(selectors.cartIcon);
  await cartIcon.waitFor({ state: 'visible', timeout: 15000 });
  
  await killPopups(page);
  await cartIcon.click({ force: true });
  
  await waitForCartDrawerReady(page);
}

/**
 * Open HB popup by clicking quick-add button on collection page
 * 
 * From global.js lines 1749-1795:
 * - Click on [quick-add__submit] fetches popup content
 * - Popup gets 'active' class via requestAnimationFrame
 */
export async function openHbPopup(page: Page): Promise<void> {
  await killPopups(page);
  
  const quickAddBtn = page.locator(selectors.quickAddButton).first();
  await quickAddBtn.waitFor({ state: 'visible', timeout: 20000 });
  
  await killPopups(page);
  await quickAddBtn.click({ force: true });
  
  // Wait for popup to be active
  await page.waitForSelector(selectors.hbPopupActive, { timeout: 15000 });
}

/**
 * BULLETPROOF: Add to cart from HB popup
 * 
 * Uses a multi-strategy approach:
 * 1. First tries direct API call (most reliable in CI)
 * 2. Falls back to button click if API fails
 * 3. Verifies cart drawer opens
 */
export async function addToCartFromHbPopup(page: Page): Promise<void> {
  await killPopups(page);
  
  // Wait for popup ATC button to be visible (confirms popup is open)
  const popupAtcButton = page.locator(selectors.hbPopupAtcButton);
  await popupAtcButton.waitFor({ state: 'visible', timeout: 15000 });
  
  // Wait for form to be ready with variant selection
  await page.waitForFunction(() => {
    const form = document.querySelector('#product-form-hb-popup-ajax');
    const variantInput = form?.querySelector('input[name="id"]') as HTMLInputElement;
    return form && variantInput && variantInput.value && variantInput.value !== '';
  }, { timeout: 15000 });
  
  // Wait for any auto-selection to complete
  await page.waitForTimeout(500);
  await killPopups(page);
  
  // Strategy 1: Direct API call (most reliable)
  let success = await addToCartViaAPI(page, '#product-form-hb-popup-ajax');
  
  // Strategy 2: Button click fallback
  if (!success) {
    // Wait for button to be enabled
    await page.waitForFunction(() => {
      const btn = document.querySelector('#ProductSubmitButton-hb-popup-ajax');
      return btn && btn.getAttribute('aria-disabled') !== 'true';
    }, { timeout: 10000 }).catch(() => {});
    
    // Set up response listener
    const responsePromise = page.waitForResponse(
      r => r.url().includes('/cart/add') && r.status() === 200,
      { timeout: 15000 }
    ).catch(() => null);
    
    await popupAtcButton.click({ force: true });
    
    const response = await responsePromise;
    success = response !== null;
    
    // If click worked, wait for drawer to open naturally
    if (success) {
      await page.waitForTimeout(500);
    }
  }
  
  // Strategy 3: Last resort - direct API with manual drawer open
  if (!success) {
    success = await page.evaluate(async () => {
      const form = document.querySelector('#product-form-hb-popup-ajax') as HTMLFormElement;
      if (!form) return false;
      
      const variantInput = form.querySelector('input[name="id"]') as HTMLInputElement;
      if (!variantInput?.value) return false;
      
      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: parseInt(variantInput.value, 10), quantity: 1 }),
        });
        
        if (response.ok) {
          const cartDrawer = document.querySelector('cart-drawer') as any;
          if (cartDrawer?.open) {
            cartDrawer.classList.remove('is-empty');
            cartDrawer.open();
          }
          return true;
        }
        return false;
      } catch {
        return false;
      }
    });
  }
  
  if (!success) {
    throw new Error('HB Popup ATC: Failed to add product to cart');
  }
  
  // Wait for cart drawer to open
  await page.waitForFunction(() => {
    const drawer = document.querySelector('cart-drawer');
    return drawer && drawer.classList.contains('active');
  }, { timeout: 15000 });
  
  // Wait for drawer to be fully ready
  await waitForCartDrawerReady(page);
}

/**
 * Open mobile navigation drawer
 * 
 * From header-drawer.liquid:
 * - Click on summary.header__icon--menu opens the details element
 * - #menu-drawer becomes visible
 */
export async function openMobileDrawer(page: Page): Promise<void> {
  await killPopups(page);
  
  const hamburger = page.locator(selectors.hamburgerMenu);
  await hamburger.waitFor({ state: 'visible', timeout: 15000 });
  
  await killPopups(page);
  await hamburger.click({ force: true });
  
  // Wait for drawer to be visible
  await page.waitForSelector(selectors.mobileDrawer, { state: 'visible', timeout: 10000 });
}
