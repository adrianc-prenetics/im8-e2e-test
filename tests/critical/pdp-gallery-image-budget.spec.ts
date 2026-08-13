import { test, expect } from '@playwright/test';
import { fastVisit } from '../helpers/test-utils';

/**
 * Live PDP image budget — pinch-zoom must not decode 2K–4K gallery/hero srcset.
 *
 * Caps are fail-closed (thumbs 1426, hero/lightbox 1445). Production still
 * serves hero 1946w until the theme fix publishes, so the assertion is
 * expected red. CI runs this after the green gate with continue-on-error.
 * Tagged `@fail-closed-until-theme` so the gate does not include it. Do not
 * skip; do not silent `test.fail()`. When the theme ships, fold the step
 * back into the gate.
 *
 * Live probe 2026-08-13:
 *   {"thumbCount":18,"thumbMax":416,"heroMax":1946,"lightboxMax":0,"lightboxDisplay":"none"}
 */
type GalleryBudget = {
  thumbCount: number;
  thumbMax: number;
  heroMax: number;
  lightboxMax: number;
  lightboxDisplay: string;
};

async function readGalleryBudget(page: import('@playwright/test').Page): Promise<GalleryBudget> {
  return page.evaluate(() => {
    const maxSrcset = (root: ParentNode, selector: string) => {
      let max = 0;
      root.querySelectorAll(selector).forEach((node) => {
        const img = node instanceof HTMLImageElement ? node : node.querySelector('img');
        const ss = img?.getAttribute('srcset') || '';
        for (const match of ss.matchAll(/(\d+)w/g)) {
          max = Math.max(max, Number(match[1]));
        }
      });
      return max;
    };

    const lightbox =
      document.querySelector('product-media-modal') ||
      document.querySelector('.product-media-modal');

    return {
      thumbCount: document.querySelectorAll(
        '.thumbnail-list img, .thumbnail img, .product__thumbnail img',
      ).length,
      thumbMax: maxSrcset(document, '.thumbnail-list img, .thumbnail img, .product__thumbnail img'),
      heroMax: maxSrcset(document, '.product__media-list img'),
      lightboxMax: lightbox ? maxSrcset(lightbox, 'img') : 0,
      lightboxDisplay: lightbox ? getComputedStyle(lightbox).display : 'missing',
    };
  });
}

test.describe('PDP mobile gallery image budget', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await fastVisit(page, '/products/essentials-pro');
  });

  test('Essentials Pro gallery is on the page', async ({ page }) => {
    const budget = await readGalleryBudget(page);
    expect(budget.thumbCount, JSON.stringify(budget)).toBeGreaterThan(0);
    await expect(page.locator('body')).toBeVisible();
  });

  // Tagged out of the green gate. Caps are the real long-term gate, not a skip.
  test('pinch-zoom must not decode 2K–4K gallery/hero srcset (iOS tab-kill)', {
    tag: '@fail-closed-until-theme',
  }, async ({ page }) => {
    const budget = await readGalleryBudget(page);
    expect(budget.thumbCount, JSON.stringify(budget)).toBeGreaterThan(0);
    // Closed lightbox must not be display:block — visibility:hidden still decodes.
    expect(budget.lightboxDisplay, JSON.stringify(budget)).toBe('none');
    // Thumbs are ~52px. 1426w is the theme cap after the pinch-zoom fix.
    expect(budget.thumbMax, JSON.stringify(budget)).toBeLessThanOrEqual(1426);
    // Fail-closed: prod hero is still 1946w (2026-08-13). This is the defect.
    expect(budget.heroMax, JSON.stringify(budget)).toBeLessThanOrEqual(1445);
    expect(budget.lightboxMax, JSON.stringify(budget)).toBeLessThanOrEqual(1445);
  });
});
