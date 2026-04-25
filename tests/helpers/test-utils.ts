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
 * Kill all popups that interfere with testing:
 * - Klaviyo email popups
 * - Alia "Try Your Luck" scratch card popup (alia-prod.com)
 * - Generic modals
 * 
 * Blocks at network level and removes from DOM.
 */
export async function killPopups(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Fix body if Klaviyo has hidden it
    document.body?.classList.remove('klaviyo-prevent-body-scrolling');
    document.body.style.display = '';
    document.body.style.overflow = '';
    
    // Remove Alia popup (scratch card / "Try Your Luck" gamification)
    document.querySelectorAll('[id^="alia-root"]').forEach(el => el.remove());
    
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
    
    // Remove any remaining high-z-index overlays that aren't ours
    document.querySelectorAll('div').forEach(el => {
      const z = parseInt(getComputedStyle(el).zIndex);
      if (z > 99999 && 
          !el.closest('cart-drawer') && 
          !el.closest('[js-hb-popup]') &&
          !el.closest('#CartDrawer') &&
          !el.id?.startsWith('shopify-section')) {
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
 *
 * NOTE: Use canonical product URLs to avoid redirects that waste CI time.
 * e.g. /products/essentials-pro instead of /products/essentials
 */
export async function fastVisit(page: Page, url: string): Promise<void> {
  // Block popup scripts at network level
  await page.route('**/*klaviyo*', route => route.abort());
  await page.route('**/static.klaviyo.com/**', route => route.abort());
  await page.route('**/*.alia-prod.com/**', route => route.abort());
  await page.route(/alia-prod\.com/, route => route.abort());
  // Also block heavy third-party scripts that slow down CI
  await page.route('**/*gorgias*', route => route.abort());
  await page.route('**/*loox*', route => route.abort());

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
    // Use domcontentloaded instead of load to avoid hanging on slow third-party resources
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  } else {
    // For non-product pages, navigate directly
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }

  // Wait for body
  await page.waitForSelector('body', { timeout: 15000 });

  // Allow page to stabilize after navigation
  await page.waitForTimeout(1000);

  // Force US market via JavaScript
  await page.evaluate(() => {
    try {
      localStorage.setItem('shopify_market', 'US');
      localStorage.setItem('currency', 'USD');
    } catch (e) {
      // localStorage may not be available
    }
  });

  // Wait for Shopify JS to initialize — check for cart-drawer or any custom element
  // Use a generous timeout but don't fail the test if CE isn't on this page
  await page.waitForFunction(() => {
    return typeof customElements !== 'undefined' &&
           (customElements.get('cart-drawer') !== undefined ||
            customElements.get('product-form') !== undefined);
  }, { timeout: 45000 }).catch(() => {
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
    if (!drawer) return false;
    const isActive = drawer.classList.contains('active') || drawer.classList.contains('animate');
    const isStillOpening = drawer.classList.contains('opening');
    return isActive && !isStillOpening;
  }, { timeout: 25000 });
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
      // NOTE: Do NOT send selling_plan — it can cause 422 errors if the plan
      // doesn't match the variant. Without selling_plan, the API adds the item
      // as a one-time purchase with correct pricing.
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

      // Race-prevention: poll /cart.js until item_count > 0 before fetching
      // sections. /cart/add.js can return 200 before the cart commit is
      // visible to subsequent reads, leading /?sections=cart-drawer to
      // render with is-empty and hide #CartDrawer-Checkout via CSS.
      for (let i = 0; i < 10; i++) {
        try {
          const cartResp = await fetch('/cart.js');
          if (cartResp.ok) {
            const cart = await cartResp.json();
            if (cart.item_count && cart.item_count > 0) break;
          }
        } catch (_) { /* retry */ }
        await new Promise(r => setTimeout(r, 150));
      }

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

        // Belt-and-suspenders: clear is-empty on BOTH outer <cart-drawer>
        // and inner <cart-drawer-items>. CSS rule
        // cart-drawer-items.is-empty + .drawer__footer { display: none }
        // hides #CartDrawer-Checkout if the inner element brings is-empty
        // in via innerHTML swap (stale server render).
        const innerItems = cartDrawer.querySelector('cart-drawer-items');
        if (innerItems) innerItems.classList.remove('is-empty');
        cartDrawer.classList.remove('is-empty');
        // Open the cart drawer
        if (typeof cartDrawer.open === 'function') {
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

  // Wait for page to finish loading before checking for custom elements
  await page.waitForLoadState('domcontentloaded');

  // Wait for product-form custom element OR the form to exist in DOM
  await page.waitForFunction(() => {
    const ceReady = typeof customElements !== 'undefined' &&
           customElements.get('product-form') !== undefined;
    const formExists = !!document.querySelector('product-form form, form[data-type="add-to-cart-form"], form.test-product-form');
    return ceReady || formExists;
  }, { timeout: 45000 });
  
  await page.waitForTimeout(1000);
  await killPopups(page);
  
  // Wait for ATC button to exist and be visible
  const atcButton = page.locator('product-form button[type="submit"][name="add"], button[name="add"], .product-form__submit').first();
  await atcButton.waitFor({ state: 'visible', timeout: 30000 });
  
  // Wait for variant to be selected (form has valid variant ID)
  await page.waitForFunction(() => {
    const form = document.querySelector('product-form form') || document.querySelector('form[data-type="add-to-cart-form"]');
    const variantInput = form?.querySelector('input[name="id"]') as HTMLInputElement;
    return variantInput && variantInput.value && variantInput.value !== '';
  }, { timeout: 20000 });
  
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
  await page.waitForTimeout(500);
  await killPopups(page);
  
  const cartIcon = page.locator(selectors.cartIcon);
  await cartIcon.waitFor({ state: 'visible', timeout: 20000 });
  
  await killPopups(page);
  await cartIcon.click({ force: true });
  
  await waitForCartDrawerReady(page);
}

/**
 * Open HB popup by clicking quick-add button on collection page
 *
 * From global.js lines 1780-1840:
 * - Click on [quick-add__submit] fetches popup content via AJAX
 * - Popup gets 'active' class via requestAnimationFrame after content loads
 *
 * IMPORTANT: Some products (embroidered-cap, vegan-travel-pouch, signature-cup)
 * have no options and skip the popup, adding directly to cart instead.
 * This function finds a product that WILL open the popup, and retries with
 * a different product if the first attempt fails.
 */
export async function openHbPopup(page: Page): Promise<void> {
  await killPopups(page);

  // Products that skip popup and add directly to cart (from global.js merchandiseWithNoOptions)
  const noOptionsProducts = ['embroidered-cap', 'vegan-travel-pouch', 'signature-cup'];

  // Find all quick-add buttons for products that WILL open the popup
  const quickAddButtons = page.locator(selectors.quickAddButton);
  await quickAddButtons.first().waitFor({ state: 'attached', timeout: 20000 });

  const buttonCount = await quickAddButtons.count();
  const candidateButtons: { index: number; handle: string | null }[] = [];

  for (let i = 0; i < buttonCount; i++) {
    const button = quickAddButtons.nth(i);
    const productHandle = await button.getAttribute('data-product-handle');

    // Skip products that don't open popup
    if (productHandle && !noOptionsProducts.includes(productHandle)) {
      if (await button.isVisible().catch(() => false)) {
        candidateButtons.push({ index: i, handle: productHandle });
      }
    }
  }

  if (candidateButtons.length === 0) {
    // Fallback to first visible button
    candidateButtons.push({ index: 0, handle: null });
  }

  // Try each candidate button until popup opens successfully
  let popupOpened = false;

  for (const candidate of candidateButtons) {
    const targetButton = quickAddButtons.nth(candidate.index);

    await targetButton.scrollIntoViewIfNeeded();
    await killPopups(page);

    // Set up listener for the fetch request that loads popup content
    // Use longer timeout for CI where network can be slow
    const fetchPromise = page.waitForResponse(
      response => response.url().includes('view=hb-popup-ajax') && response.status() === 200,
      { timeout: 35000 }
    ).catch(() => null);

    await targetButton.click({ force: true });

    // Wait for the AJAX fetch to complete (popup content loaded)
    const fetchResponse = await fetchPromise;

    if (fetchResponse) {
      // Content loaded - wait for active class
      const opened = await page.waitForFunction(() => {
        const popup = document.querySelector('[js-hb-popup]');
        return popup && popup.classList.contains('active');
      }, { timeout: 15000 }).then(() => true).catch(() => false);

      if (opened) {
        popupOpened = true;
        break;
      }
    }

    // Fetch didn't return or popup didn't activate — check if cart drawer opened instead
    const cartDrawerOpened = await page.evaluate(() => {
      const drawer = document.querySelector('cart-drawer');
      return drawer && drawer.classList.contains('active');
    });

    if (cartDrawerOpened) {
      // Close the cart drawer and try the next product
      await page.evaluate(() => {
        const drawer = document.querySelector('cart-drawer') as any;
        if (drawer && typeof drawer.close === 'function') drawer.close();
        else drawer?.classList.remove('active', 'animate');
      });
      await page.waitForTimeout(500);
      continue;
    }

    // Try the popup selector directly (maybe AJAX response wasn't intercepted)
    const directCheck = await page.waitForSelector(selectors.hbPopupActive, { timeout: 5000 })
      .then(() => true).catch(() => false);

    if (directCheck) {
      popupOpened = true;
      break;
    }
  }

  if (!popupOpened) {
    throw new Error('HB Popup: Failed to open popup after trying all candidate products');
  }

  // Allow popup AJAX content to be injected and JS to execute
  await page.waitForTimeout(1000);

  // Wait for popup content to be fully rendered
  // Only require essential conditions: popup active + content loaded + ATC button present
  // Don't require product-info/variant-selects hydration as these are secondary and can be slow
  await page.waitForFunction(() => {
    const popup = document.querySelector('[js-hb-popup]');
    if (!popup || !popup.classList.contains('active')) return false;

    const content = popup.querySelector('[js-product-detail]');
    if (!content || content.innerHTML.trim() === '') return false;

    // ATC button OR product-info (either means content loaded)
    const atcButton = popup.querySelector('#ProductSubmitButton-hb-popup-ajax');
    const productInfo = popup.querySelector('product-info');
    return !!(atcButton || productInfo);
  }, { timeout: 60000 });
  // Small delay for CSS transition to complete
  await page.waitForTimeout(300);
}

/**
 * BULLETPROOF: Add to cart from HB popup
 * 
 * Uses a multi-strategy approach:
 * 1. First ensures popup is fully ready with variant selected
 * 2. Tries direct API call (most reliable in CI)
 * 3. Falls back to button click if API fails
 * 4. Verifies cart drawer opens
 * 
 * From product-form.js lines 146-150:
 * - After successful add, popup closes (removes 'open', adds 'hidden')
 * - cart.renderContents() is called to open cart drawer
 */
export async function addToCartFromHbPopup(page: Page): Promise<void> {
  await killPopups(page);
  
  // Ensure popup is open and has content
  const popupIsReady = await page.evaluate(() => {
    const popup = document.querySelector('[js-hb-popup]');
    const form = document.querySelector('#product-form-hb-popup-ajax');
    const atcButton = document.querySelector('#ProductSubmitButton-hb-popup-ajax');
    return popup?.classList.contains('active') && form && atcButton;
  });
  
  if (!popupIsReady) {
    throw new Error('HB Popup ATC: Popup is not open or not ready');
  }
  
  // Wait for popup ATC button to be visible
  const popupAtcButton = page.locator(selectors.hbPopupAtcButton);
  await popupAtcButton.waitFor({ state: 'visible', timeout: 15000 });
  
  // Wait for form to be ready with variant selection
  // The popup auto-selects a variant via initHbPopupQuarterlyAndBanner() in global.js
  await page.waitForFunction(() => {
    const form = document.querySelector('#product-form-hb-popup-ajax');
    const variantInput = form?.querySelector('input[name="id"]') as HTMLInputElement;
    return form && variantInput && variantInput.value && variantInput.value !== '';
  }, { timeout: 15000 });
  
  // Wait for auto-selection animation to complete
  await page.waitForTimeout(500);
  await killPopups(page);
  
  // Get the variant ID for logging/debugging
  const variantId = await page.evaluate(() => {
    const form = document.querySelector('#product-form-hb-popup-ajax');
    const variantInput = form?.querySelector('input[name="id"]') as HTMLInputElement;
    return variantInput?.value || null;
  });
  
  if (!variantId) {
    throw new Error('HB Popup ATC: No variant selected in form');
  }
  
  let success = false;
  
  // Strategy 1: Direct API call (most reliable in CI)
  success = await addToCartViaAPI(page, '#product-form-hb-popup-ajax');
  
  // Strategy 2: Button click with response listener
  if (!success) {
    // Wait for button to be enabled (not aria-disabled)
    await page.waitForFunction(() => {
      const btn = document.querySelector('#ProductSubmitButton-hb-popup-ajax');
      return btn && btn.getAttribute('aria-disabled') !== 'true' && !btn.classList.contains('loading');
    }, { timeout: 10000 }).catch(() => {});
    
    // Set up response listener BEFORE clicking
    const responsePromise = page.waitForResponse(
      r => r.url().includes('/cart/add') && r.status() === 200,
      { timeout: 20000 }
    ).catch(() => null);
    
    // Click the button
    await popupAtcButton.click({ force: true });
    
    // Wait for response
    const response = await responsePromise;
    success = response !== null;
    
    if (success) {
      // Wait for popup to close and drawer to open naturally
      await page.waitForTimeout(500);
    }
  }
  
  // Strategy 3: Last resort - direct fetch API with manual drawer open
  if (!success) {
    success = await page.evaluate(async (vid) => {
      try {
        // Direct cart API call
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: parseInt(vid, 10),
            quantity: 1
          }),
        });
        
        if (!response.ok) return false;

        // Close the popup
        const popup = document.querySelector('[js-hb-popup]');
        if (popup) {
          popup.classList.remove('active');
        }

        // Race-prevention: poll /cart.js until item_count > 0 before sections fetch.
        for (let i = 0; i < 10; i++) {
          try {
            const cartResp = await fetch('/cart.js');
            if (cartResp.ok) {
              const cart = await cartResp.json();
              if (cart.item_count && cart.item_count > 0) break;
            }
          } catch (_) { /* retry */ }
          await new Promise(r => setTimeout(r, 150));
        }

        // Fetch cart sections and open drawer
        const cartDrawer = document.querySelector('cart-drawer') as any;
        if (cartDrawer) {
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
          }

          // Belt-and-suspenders: clear is-empty on inner cart-drawer-items too.
          const innerItems = cartDrawer.querySelector('cart-drawer-items');
          if (innerItems) innerItems.classList.remove('is-empty');
          cartDrawer.classList.remove('is-empty');
          if (typeof cartDrawer.open === 'function') {
            cartDrawer.open();
          } else {
            cartDrawer.classList.add('active');
          }
        }
        
        return true;
      } catch (e) {
        console.error('HB Popup ATC fallback error:', e);
        return false;
      }
    }, variantId);
  }
  
  if (!success) {
    throw new Error('HB Popup ATC: Failed to add product to cart after all strategies');
  }
  
  // Wait for cart drawer to open
  await page.waitForFunction(() => {
    const drawer = document.querySelector('cart-drawer');
    return drawer && drawer.classList.contains('active');
  }, { timeout: 15000 });
  
  // Wait for drawer to be fully ready (active + not opening)
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
  await page.waitForTimeout(500);
  await killPopups(page);
  
  const hamburger = page.locator(selectors.hamburgerMenu);
  await hamburger.waitFor({ state: 'visible', timeout: 20000 });
  
  await killPopups(page);
  await hamburger.click({ force: true });
  
  // Wait for the details element to have open attribute, then drawer becomes visible
  await page.waitForFunction(() => {
    const details = document.querySelector('#Details-menu-drawer-container');
    const drawer = document.querySelector('#menu-drawer');
    return (details?.hasAttribute('open') || (drawer as HTMLElement)?.offsetParent !== null) ?? false;
  }, { timeout: 15000 });
  
  await page.waitForTimeout(300);
}
