# IM8 Health E2E Testing Suite

Playwright monitors im8health.com critical journeys. Cypress was a duplicate of the same eight specs and is gone — it never finished a scheduled run (10-minute cancel cap).

Chromium-only in CI. One worker (Shopify rate limits). Bot verification skips, it does not fail. Web Bot Auth headers are injected when `SHOPIFY_SIGNATURE*` secrets exist.

## When tests run

| Trigger | Frequency |
|---------|-----------|
| **Scheduled** | Daily 06:30 UTC |
| **Push to main** | Yes |
| **Pull request** | Yes |
| **Manual** | Actions → Playwright E2E Tests → Run workflow |

`concurrency` cancels in-progress runs on the same ref so push + dispatch do not double-hit Shopify.

Public GitHub repos disable scheduled workflows after 60 days with no push. A commit resets that.

For fewer Shopify bot challenges, add Web Bot Auth secrets (`SHOPIFY_SIGNATURE`, `SHOPIFY_SIGNATURE_INPUT`, `SHOPIFY_SIGNATURE_AGENT`) from Shopify admin → Online Store → Preferences → Crawler access (max 3 months, then rotate).

Results: https://github.com/adrianc-prenetics/im8-e2e-test/actions

## Journeys

| Spec | What it covers |
|------|----------------|
| `tests/critical/homepage.spec.ts` | Homepage load, product links |
| `tests/critical/add-to-cart.spec.ts` | PDP ATC, cart drawer opens |
| `tests/critical/cart-drawer.spec.ts` | Cart icon, drawer, checkout button |
| `tests/critical/checkout-flow.spec.ts` | Navigate toward Shopify checkout |
| `tests/critical/header-navigation.spec.ts` | Header, mega menu |
| `tests/critical/mobile-navigation.spec.ts` | Hamburger, mobile drawer |
| `tests/critical/hb-popup-atc.spec.ts` | Collection quick-add popup |
| `tests/critical/sticky-atc-bar.spec.ts` | ATC still present after scroll |
| `tests/critical/pdp-gallery-image-budget.spec.ts` | Gallery exists (green gate) + srcset caps (known live defect until theme pinch-zoom publishes) |

Green gate is `npx playwright test --project=chromium --grep-invert "pinch-zoom must not decode"`. The pinch-zoom srcset caps (hero/thumb/lightbox 1445/1426/1445) stay fail-closed and run after the gate with `continue-on-error` so a known live 1946w hero does not hide other failures. When the theme ships, fold that step back into the gate.

## Local

```bash
npm install
npx playwright install chromium
npm run test:gate
```

**Last Updated:** August 2026
**Maintained by:** Adrian Chan
