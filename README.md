# IM8 Health E2E Testing Suite

## Executive Summary

This automated testing suite continuously monitors the IM8 Health storefront (im8health.com) to ensure critical customer journeys work correctly. Tests run automatically and will alert the team if any issues are detected.

---

## 🕐 When Tests Run

Playwright is the gate. Cypress is legacy (manual dispatch only).

| Trigger | Frequency |
|---------|-----------|
| **Scheduled** | Daily 06:30 UTC |
| **Every push to main** | Yes |
| **Every pull request** | Yes |
| **Manual trigger** | Actions → Playwright E2E Tests → Run workflow |

Public GitHub repos disable scheduled workflows after 60 days with no push. A commit or Actions enable click resets that.

For fewer Shopify bot challenges, add Web Bot Auth secrets (`SHOPIFY_SIGNATURE`, `SHOPIFY_SIGNATURE_INPUT`, `SHOPIFY_SIGNATURE_AGENT`) from Shopify admin → Online Store → Preferences → Crawler access (max 3 months, then rotate).

Results: https://github.com/adrianc-prenetics/im8-e2e-test/actions

---

## ✅ Customer Journeys & Interactions Tested

### 1. **Homepage Experience** (`homepage.cy.js`)
- ✓ Homepage loads successfully
- ✓ Product links are present and accessible
- ✓ Page renders without errors

### 2. **Add to Cart Flow** (`add-to-cart.cy.js`)
- ✓ Product page loads with Add to Cart button
- ✓ Add to Cart button is clickable and functional
- ✓ Products can be added to cart from product pages

### 3. **Cart Drawer Functionality** (`cart-drawer.cy.js`)
- ✓ Cart icon is visible in header
- ✓ Clicking cart icon opens the cart drawer
- ✓ Cart drawer displays checkout button when items are in cart
- ✓ Items added to cart appear in the drawer

### 4. **Checkout Flow** (`checkout-flow.cy.js`)
- ✓ Can add item to cart from product page
- ✓ Can open cart drawer after adding items
- ✓ Checkout button is visible and clickable
- ✓ Clicking checkout navigates to Shopify checkout page

### 5. **Desktop Navigation & Mega Menu** (`header-navigation.cy.js`)
- ✓ Header with logo is visible
- ✓ Navigation links are present
- ✓ "Shop" mega menu opens on click
- ✓ Mega menu displays product links (Essentials, Longevity, etc.)

### 6. **Mobile Navigation** (`mobile-navigation.cy.js`)
- ✓ Page loads correctly on mobile viewport (375x812)
- ✓ Hamburger menu button is visible
- ✓ Clicking hamburger opens mobile drawer menu
- ✓ Mobile drawer contains navigation links

### 7. **Quick Add Popup (HB Popup)** (`hb-popup-atc.cy.js`)
- ✓ Collection page displays product cards with ATC buttons
- ✓ Clicking ATC on product card opens quick-add popup
- ✓ Popup displays product options (Format, Plan selections)
- ✓ Popup has working Add to Cart button
- ✓ Can successfully add products to cart from popup

### 8. **Sticky Add to Cart Bar** (`sticky-atc-bar.cy.js`)
- ✓ Product page has ATC functionality after scrolling
- ✓ ATC button remains accessible throughout page

---

## 📊 Test Coverage Summary

| Area | Tests | Critical User Actions Covered |
|------|-------|------------------------------|
| Homepage | 2 | Page load, product discovery |
| Add to Cart | 2 | ATC button visibility, click functionality |
| Cart Drawer | 4 | Open/close drawer, checkout button, item display |
| Checkout | 3 | Full checkout navigation flow |
| Desktop Nav | 3 | Header, mega menu, navigation links |
| Mobile Nav | 4 | Hamburger menu, mobile drawer |
| Quick Add Popup | 5 | Collection page ATC, popup options |
| Sticky ATC | 1 | Scroll-based ATC functionality |
| **TOTAL** | **24** | |

---

## 🚨 What Happens When Tests Fail

1. **GitHub Actions shows failure** - Red X on the commit/PR
2. **Screenshots captured** - Automatically saved showing the failure state
3. **Team notified** - Via GitHub notifications

---

## 🔧 Technical Details

### Test Framework
- **Cypress** - Industry-standard E2E testing framework
- **Chrome browser** - Tests run in headless Chrome

### Key Features
- **Popup handling** - Automatically dismisses Klaviyo marketing popups
- **Cookie consent** - Handles cookie banners automatically
- **Force interactions** - Bypasses overlay issues for reliable testing
- **Mobile & Desktop** - Tests both viewport sizes

### Reference Files (from shopify-im8-ui theme)
- `snippets/cart-drawer.liquid` - Cart drawer structure
- `sections/header.liquid` - Header and cart icon
- `snippets/header-mega-menu.liquid` - Desktop navigation
- `snippets/header-drawer.liquid` - Mobile navigation
- `snippets/hb-popup.liquid` - Quick add popup

---

## 📁 Project Structure

```
im8-e2e-test/
├── cypress/
│   ├── e2e/critical/          # All test files
│   │   ├── add-to-cart.cy.js
│   │   ├── cart-drawer.cy.js
│   │   ├── checkout-flow.cy.js
│   │   ├── hb-popup-atc.cy.js
│   │   ├── header-navigation.cy.js
│   │   ├── homepage.cy.js
│   │   ├── mobile-navigation.cy.js
│   │   └── sticky-atc-bar.cy.js
│   └── support/
│       ├── commands.js        # Custom test helpers
│       └── e2e.js             # Global configuration
├── .github/workflows/
│   └── cypress-tests.yml      # CI/CD configuration
└── cypress.config.js          # Cypress settings
```

---

## 🚀 Running Tests Locally

```bash
# Install dependencies
npm install

# Run tests in headless mode
npm test

# Open Cypress UI for debugging
npm run cypress:open
```

---

## 📈 Future Enhancements (Potential)

- [x] ~~Add scheduled runs~~ (Now running every hour)
- [ ] Slack notifications on failure
- [ ] Visual regression testing
- [ ] Performance monitoring
- [ ] Multi-region testing

---

**Last Updated:** January 2026  
**Maintained by:** Adrian Chan
