# IM8 Health E2E Testing Suite

Playwright monitors im8health.com critical journeys. Cypress was a duplicate of the same eight specs and is gone — it never finished a scheduled run (10-minute cancel cap).

## When tests run

| Trigger | Frequency |
|---------|-----------|
| **Scheduled** | Daily 06:30 UTC |
| **Push to main** | Yes |
| **Pull request** | Yes |
| **Manual** | Actions → Playwright E2E Tests → Run workflow |

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

## Local

```bash
npm install
npx playwright install chromium
npm test
```

**Last Updated:** August 2026
**Maintained by:** Adrian Chan
