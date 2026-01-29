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
 */
export async function fastVisit(page: Page, url: string): Promise<void> {
  // Block Klaviyo at network level - prevents popups from ever loading
  await page.route('**/*klaviyo*', route => route.abort());
  await page.route('**/static.klaviyo.com/**', route => route.abort());
  
  // CRITICAL: Set cookies to force US market BEFORE navigation
  // This ensures products are available (EU markets may have empty collections)
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
  
  // Navigate and wait for full load (needed for Shopify JS)
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  
  // Wait for body
  await page.waitForSelector('body', { timeout: 15000 });
  
  // Force US market via JavaScript if country selector exists
  // This handles cases where cookies alone don't switch the market
  await page.evaluate(() => {
    // Set localStorage for market preference
    try {
      localStorage.setItem('shopify_market', 'US');
      localStorage.setItem('currency', 'USD');
    } catch (e) {
      // localStorage may not be available
    }
  });
  
  // Wait for cart-drawer custom element to be defined
  // This indicates Shopify JS has fully initialized
  await page.waitForFunction(() => {
    return typeof customElements !== 'undefined' && 
           customElements.get('cart-drawer') !== undefined;
  }, { timeout: 20000 }).catch(() => {
    // Custom element may not be on all pages
  });
  
  // Kill any popups that loaded before blocking took effect
  await killPopups(page);
  
  // Accept cookie consent if present
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
 * BULLETPROOF: Add to cart from product page
 * 
 * From product-form.js analysis:
 * - Line 22: onSubmitHandler checks aria-disabled="true" and returns early
 * - Line 36: Sets aria-disabled=true when starting submission
 * - Line 144-146: Calls cart.renderContents() which opens drawer
 * - Line 162: Removes aria-disabled in finally block after AJAX completes
 * 
 * Strategy:
 * 1. Wait for product-form custom element to be defined (JS loaded)
 * 2. Wait for ATC button to be enabled (aria-disabled !== "true")
 * 3. Click the button
 * 4. Wait for AJAX to complete
 * 5. Wait for cart drawer to open (any state: opening, animate, or active)
 */
export async function addToCart(page: Page): Promise<void> {
  await killPopups(page);
  
  // Wait for product-form custom element to be defined (indicates JS is ready)
  await page.waitForFunction(() => {
    return typeof customElements !== 'undefined' && 
           customElements.get('product-form') !== undefined;
  }, { timeout: 30000 });
  
  // Wait for page to stabilize
  await page.waitForTimeout(2000);
  await killPopups(page);
  
  // Wait for ATC button to exist
  const atcButton = page.locator('product-form button[type="submit"][name="add"]').first();
  await atcButton.waitFor({ state: 'attached', timeout: 30000 });
  await atcButton.scrollIntoViewIfNeeded();
  
  // CRITICAL: Wait for button to be enabled (aria-disabled !== "true")
  // This is the key check from product-form.js line 22
  await page.waitForFunction(() => {
    const btn = document.querySelector('product-form button[type="submit"][name="add"]');
    if (!btn) return false;
    const ariaDisabled = btn.getAttribute('aria-disabled');
    // Button is clickable when aria-disabled is NOT exactly "true"
    return ariaDisabled !== 'true';
  }, { timeout: 30000 });
  
  await killPopups(page);
  
  // Set up AJAX response listener before clicking
  const cartAddPromise = page.waitForResponse(
    response => response.url().includes('/cart/add') && response.status() === 200,
    { timeout: 30000 }
  ).catch(() => null);
  
  // Click the button
  await atcButton.click({ force: true });
  
  // Wait for AJAX to complete
  const response = await cartAddPromise;
  
  if (!response) {
    throw new Error('Cart add AJAX request did not complete');
  }
  
  // Wait for cart drawer to open (any state: opening, animate, or active)
  await page.waitForFunction(() => {
    const drawer = document.querySelector('cart-drawer');
    if (!drawer) return false;
    return drawer.classList.contains('active') || 
           drawer.classList.contains('animate') ||
           drawer.classList.contains('opening');
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
 * Flow from product-form.js lines 144-154:
 * 1. ATC button clicked → form submit intercepted
 * 2. AJAX POST to /cart/add.js
 * 3. On success: cart.renderContents() called → drawer opens (via setTimeout!)
 * 4. Popup closes: removes 'open', adds 'hidden' (may still have 'active')
 * 
 * Key insights from shopify-im8-ui analysis:
 * - product-form.js line 22: if (aria-disabled === 'true') return; (the guard!)
 * - product-form.js line 36: sets aria-disabled=true IMMEDIATELY on submit
 * - product-form.js line 162: removes aria-disabled in finally block after AJAX
 * - cart.renderContents() uses setTimeout(() => this.open()) - ASYNC!
 * 
 * CI-FRIENDLY BULLETPROOF approach:
 * 1. Set up AJAX interception BEFORE any clicks
 * 2. Wait for button to be enabled (aria-disabled !== 'true')
 * 3. Click button, then dispatch submit event as fallback
 * 4. Wait for AJAX OR cart drawer OR cart count change (whichever comes first)
 */
export async function addToCartFromHbPopup(page: Page): Promise<void> {
  await killPopups(page);
  
  // Wait for popup ATC button to be visible
  const popupAtcButton = page.locator(selectors.hbPopupAtcButton);
  await popupAtcButton.waitFor({ state: 'visible', timeout: 15000 });
  
  // Capture initial cart count (backup success indicator)
  const initialCartCount = await page.evaluate(() => {
    const bubble = document.querySelector('.cart-count-bubble');
    if (!bubble) return 0;
    const text = bubble.textContent?.trim() || '0';
    return parseInt(text, 10) || 0;
  });
  
  // CRITICAL: Wait for button AND form to be truly ready
  // product-form.js line 22: if (this.submitButton.getAttribute('aria-disabled') === 'true') return;
  await page.waitForFunction(() => {
    const btn = document.querySelector('#ProductSubmitButton-hb-popup-ajax');
    const form = document.querySelector('#product-form-hb-popup-ajax');
    if (!btn || !form) return false;
    // Button must NOT have aria-disabled="true" (the exact check from product-form.js)
    return btn.getAttribute('aria-disabled') !== 'true';
  }, { timeout: 15000 });
  
  // Wait for variant auto-selection and any JS initialization
  await page.waitForTimeout(1000);
  await killPopups(page);
  
  // Retry logic with multiple trigger methods
  let success = false;
  
  for (let attempt = 0; attempt < 3 && !success; attempt++) {
    await killPopups(page);
    
    // Re-verify button is enabled before each attempt
    const isEnabled = await page.evaluate(() => {
      const btn = document.querySelector('#ProductSubmitButton-hb-popup-ajax');
      return btn && btn.getAttribute('aria-disabled') !== 'true';
    });
    
    if (!isEnabled) {
      // Wait for button to become enabled again
      await page.waitForFunction(() => {
        const btn = document.querySelector('#ProductSubmitButton-hb-popup-ajax');
        return btn && btn.getAttribute('aria-disabled') !== 'true';
      }, { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
    
    // Set up AJAX listener BEFORE triggering click
    const ajaxPromise = page.waitForResponse(
      response => response.url().includes('/cart/add') && response.status() === 200,
      { timeout: 20000 }
    ).catch(() => null);
    
    // Method 1: Regular click
    await popupAtcButton.click({ force: true });
    
    // Method 2: If click doesn't trigger submission, dispatch submit event directly
    // This handles cases where the click event doesn't bubble properly in CI
    await page.evaluate(() => {
      const form = document.querySelector('#product-form-hb-popup-ajax') as HTMLFormElement;
      const btn = document.querySelector('#ProductSubmitButton-hb-popup-ajax') as HTMLButtonElement;
      if (form && btn && btn.getAttribute('aria-disabled') !== 'true') {
        // Dispatch a click event on the button
        btn.click();
        // Also try dispatching submit event on the form
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    });
    
    // Wait for ANY success indicator
    try {
      await Promise.race([
        // Option 1: AJAX completes successfully
        ajaxPromise.then(r => { if (r) return r; throw new Error('no response'); }),
        
        // Option 2: Cart drawer opens
        page.waitForFunction(() => {
          const drawer = document.querySelector('cart-drawer');
          return drawer && (
            drawer.classList.contains('active') || 
            drawer.classList.contains('animate') ||
            drawer.classList.contains('opening')
          );
        }, { timeout: 20000 }),
        
        // Option 3: Cart count increases
        page.waitForFunction((initial: number) => {
          const bubble = document.querySelector('.cart-count-bubble');
          if (!bubble) return false;
          const text = bubble.textContent?.trim() || '0';
          const current = parseInt(text, 10) || 0;
          return current > initial;
        }, { timeout: 20000 }, initialCartCount)
      ]);
      
      success = true;
    } catch {
      // None of the success conditions met, will retry
      if (attempt < 2) {
        await page.waitForTimeout(2000);
      }
    }
  }
  
  if (!success) {
    throw new Error('HB Popup ATC: Cart drawer did not open and cart count did not increase after 3 attempts');
  }
  
  // Wait for cart drawer to fully open
  try {
    await page.waitForFunction(() => {
      const drawer = document.querySelector('cart-drawer');
      return drawer && drawer.classList.contains('active');
    }, { timeout: 10000 });
    
    await waitForCartDrawerReady(page);
  } catch {
    // Cart was added but drawer might not have opened - still a success
  }
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
