import { test, expect } from '@playwright/test';
import { fastVisit } from '../helpers/test-utils';

/**
 * Live PDP image budget — gallery thumbs and closed lightbox must not decode
 * 2K–4K srcset. Hero stays fail-closed at 1445w until the theme cap publishes
 * (prod still serves 1946w). CI runs the passing thumbs/lightbox check as a
 * named step, then the hero cap with continue-on-error. Tagged
 * `@fail-closed-until-theme` so the green gate does not include the known-red
 * hero assertion. Do not skip; do not silent `test.fail()`. When the theme
 * ships, fold the hero step back into the gate.
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

  test('gallery thumbs stay under decode budget and closed lightbox is not decoded', {
    tag: '@pdp-image-budget',
  }, async ({ page }) => {
    const budget = await readGalleryBudget(page);
    expect(budget.thumbCount, JSON.stringify(budget)).toBeGreaterThan(0);
    // Thumbs are ~52px. 1426w is the theme cap after the srcset fix.
    expect(budget.thumbMax, JSON.stringify(budget)).toBeLessThanOrEqual(1426);
    // Closed lightbox must not be display:block — visibility:hidden still decodes.
    expect(budget.lightboxDisplay, JSON.stringify(budget)).toBe('none');
    expect(budget.lightboxMax, JSON.stringify(budget)).toBeLessThanOrEqual(1445);
  });

  test.describe('fail-closed hero cap', () => {
    test.describe.configure({ retries: 0 });

    // Tagged out of the green gate. Cap is the real long-term gate, not a skip.
    test('hero srcset must stay at or under 1445w', {
      tag: '@fail-closed-until-theme',
    }, async ({ page }) => {
      const budget = await readGalleryBudget(page);
      expect(budget.thumbCount, JSON.stringify(budget)).toBeGreaterThan(0);
      // Fail-closed: prod hero is still 1946w (2026-08-13). This is the defect.
      expect(budget.heroMax, JSON.stringify(budget)).toBeLessThanOrEqual(1445);
    });
  });
});
