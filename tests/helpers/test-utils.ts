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
 */
export async function fastVisit(page: Page, url: string): Promise<void> {
  // Block Klaviyo at network level - prevents popups from ever loading
  await page.route('**/*klaviyo*', route => route.abort());
  await page.route('**/static.klaviyo.com/**', route => route.abort());
  
  // Navigate and wait for full load (needed for Shopify JS)
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  
  // Wait for body
  await page.waitForSelector('body', { timeout: 15000 });
  
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
 * Add to cart from product page
 * 
 * Flow from product-form.js:
 * 1. Click ATC button (triggers form submit event)
 * 2. Button gets 'loading' class, spinner shown
 * 3. AJAX POST to /cart/add.js
 * 4. On success: cart.renderContents() called
 * 5. renderContents() calls open() which adds 'active' class
 * 6. Button 'loading' class removed
 * 
 * Key insight: The form uses addEventListener('submit') which is intercepted.
 * We need to ensure the button click triggers the form submit event properly.
 */
export async function addToCart(page: Page): Promise<void> {
  await killPopups(page);
  
  // Wait for product-form custom element to be defined (indicates JS is ready)
  await page.waitForFunction(() => {
    return typeof customElements !== 'undefined' && 
           customElements.get('product-form') !== undefined;
  }, { timeout: 20000 }).catch(() => {});
  
  // Wait for ATC button to be visible and enabled
  const atcButton = page.locator(selectors.atcButton).first();
  await atcButton.waitFor({ state: 'visible', timeout: 20000 });
  
  // Ensure button is not disabled or aria-disabled
  await page.waitForFunction(() => {
    const btn = document.querySelector('[id^="ProductSubmitButton"], button[name="add"], .product-form__submit');
    return btn && 
           !btn.hasAttribute('disabled') && 
           btn.getAttribute('aria-disabled') !== 'true';
  }, { timeout: 10000 });
  
  await atcButton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  
  // Kill popups right before clicking
  await killPopups(page);
  
  // Try clicking and waiting for cart drawer with retries
  let success = false;
  
  for (let attempt = 0; attempt < 3 && !success; attempt++) {
    await killPopups(page);
    
    // Set up request interception to verify AJAX call completes
    const cartAddPromise = page.waitForResponse(
      response => response.url().includes('/cart/add') && response.status() === 200,
      { timeout: 20000 }
    ).catch(() => null);
    
    // Click ATC button
    if (attempt === 0) {
      await atcButton.click();
    } else {
      // Use force on retries in case something is blocking
      await atcButton.click({ force: true });
    }
    
    // Wait for the cart/add AJAX request to complete
    const response = await cartAddPromise;
    
    if (response) {
      // AJAX succeeded, wait for cart drawer
      try {
        await page.waitForSelector(selectors.cartDrawerActive, { timeout: 10000 });
        success = true;
      } catch (e) {
        // Drawer didn't open, will retry
        await page.waitForTimeout(500);
      }
    } else {
      // AJAX didn't complete, wait and retry
      await page.waitForTimeout(1000);
    }
  }
  
  if (!success) {
    throw new Error('Cart drawer did not open after clicking ATC button');
  }
  
  // Wait for drawer to be fully ready (opening animation complete)
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
 * - The popup adds 'hidden' class but may keep 'active' class
 * - cart.renderContents() uses setTimeout(() => this.open()) - ASYNC!
 * - The popup closes BEFORE cart drawer opens (race condition)
 * - Cart drawer open sequence: opening → animate + active → (opening removed)
 * 
 * BULLETPROOF approach:
 * 1. Wait for AJAX to complete (primary success indicator)
 * 2. Don't rely on popup 'hidden' class timing
 * 3. Wait for cart drawer with any open state class
 */
export async function addToCartFromHbPopup(page: Page): Promise<void> {
  await killPopups(page);
  
  // Wait for popup ATC button to be visible and enabled
  const popupAtcButton = page.locator(selectors.hbPopupAtcButton);
  await popupAtcButton.waitFor({ state: 'visible', timeout: 15000 });
  
  // Ensure button is not disabled and form is ready
  await page.waitForFunction(() => {
    const btn = document.querySelector('#ProductSubmitButton-hb-popup-ajax');
    const form = document.querySelector('#product-form-hb-popup-ajax');
    return btn && form &&
           !btn.hasAttribute('disabled') && 
           btn.getAttribute('aria-disabled') !== 'true';
  }, { timeout: 10000 });
  
  // Wait for any variant selection to be ready (auto-selection happens with delays)
  await page.waitForTimeout(500);
  await killPopups(page);
  
  // Try up to 3 times to click and get AJAX response
  let ajaxSuccess = false;
  
  for (let attempt = 0; attempt < 3 && !ajaxSuccess; attempt++) {
    await killPopups(page);
    
    // Set up response listener BEFORE clicking
    const cartAddPromise = page.waitForResponse(
      response => response.url().includes('/cart/add') && response.status() === 200,
      { timeout: 15000 }
    ).catch(() => null);
    
    // Click the ATC button
    if (attempt === 0) {
      await popupAtcButton.click();
    } else {
      // Use force on retries
      await popupAtcButton.click({ force: true });
    }
    
    // Wait for AJAX to complete
    const response = await cartAddPromise;
    
    if (response) {
      ajaxSuccess = true;
    } else {
      // Wait before retry
      await page.waitForTimeout(1000);
    }
  }
  
  if (!ajaxSuccess) {
    throw new Error('HB Popup ATC: AJAX request to /cart/add did not complete after 3 attempts');
  }
  
  // AJAX succeeded - now wait for cart drawer to open
  // renderContents() calls open() via setTimeout, so we need to wait
  // BULLETPROOF: Check for ANY open state class (opening, animate, or active)
  await page.waitForFunction(() => {
    const drawer = document.querySelector('cart-drawer');
    if (!drawer) return false;
    return drawer.classList.contains('active') || 
           drawer.classList.contains('animate') ||
           drawer.classList.contains('opening');
  }, { timeout: 15000 });
  
  // Wait for drawer to be fully ready (active without opening)
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
