# im8 Store E2E Tests

Cypress E2E testing suite for [im8store.myshopify.com](https://im8store.myshopify.com).

## Project Description

This project contains end-to-end tests for the im8 Shopify store, covering critical user flows including:

- **Mobile Navigation** - Hamburger menu, drawer functionality, menu items
- **Cart Drawer** - Opening/closing, adding items, quantity controls, checkout
- **Add to Cart** - Product page add to cart functionality
- **Checkout Flow** - Cart to checkout navigation
- **Header Navigation** - Desktop menu, mega menus, sticky header
- **Homepage** - Page load, images, links, responsive design
- **HB Popup ATC** - Quick-add popup drawer on collection pages

## Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn

## Installation

```bash
# Clone the repository
git clone git@github.com:adrianc-prenetics/im8-e2e-test.git

# Navigate to project directory
cd im8-e2e-test

# Install dependencies
npm install
```

## Running Tests Locally

### Open Cypress Test Runner (Interactive Mode)

```bash
npm run cy:open
```

### Run All Tests (Headless)

```bash
npm run cy:run
```

### Run Tests by Viewport

```bash
# Desktop viewport (1280x720)
npm run cy:run:desktop

# Mobile viewport (375x812)
npm run cy:run:mobile
```

### Run Tests in Headed Mode

```bash
npm run cy:run:headed
```

### Run Tests in Specific Browser

```bash
# Chrome
npm run cy:run:chrome

# Firefox
npm run cy:run:firefox
```

### Run Critical Tests Only

```bash
npm run cy:run:critical
```

## Project Structure

```
im8-e2e-test/
├── cypress/
│   ├── e2e/
│   │   └── critical/
│   │       ├── mobile-navigation.cy.js
│   │       ├── cart-drawer.cy.js
│   │       ├── add-to-cart.cy.js
│   │       ├── checkout-flow.cy.js
│   │       ├── header-navigation.cy.js
│   │       ├── homepage.cy.js
│   │       └── hb-popup-atc.cy.js
│   ├── support/
│   │   ├── commands.js      # Custom Cypress commands
│   │   └── e2e.js           # Support file configuration
│   └── fixtures/
│       └── products.json    # Test data and selectors
├── .github/
│   └── workflows/
│       └── cypress-tests.yml  # GitHub Actions workflow
├── cypress.config.js        # Cypress configuration
├── package.json
├── .gitignore
└── README.md
```

## Test Configuration

### Timeouts

| Setting | Value |
|---------|-------|
| Default Command Timeout | 15 seconds |
| Page Load Timeout | 60 seconds |
| Request Timeout | 15 seconds |
| Response Timeout | 30 seconds |

### Viewports

| Device | Width | Height |
|--------|-------|--------|
| Desktop | 1280 | 720 |
| Mobile | 375 | 812 |
| Tablet | 768 | 1024 |

### Retries

- **Run Mode (CI)**: 2 retries
- **Open Mode (Local)**: 0 retries

## Custom Commands

The following custom commands are available:

### Viewport Commands
- `cy.setMobileViewport()` - Set viewport to 375x812
- `cy.setTabletViewport()` - Set viewport to 768x1024
- `cy.setDesktopViewport()` - Set viewport to 1280x720

### Mobile Navigation
- `cy.openMobileNav()` - Open mobile navigation drawer
- `cy.closeMobileNav()` - Close mobile navigation drawer
- `cy.clickMobileMenuItem(text)` - Click a menu item by text
- `cy.expandMobileSubmenu(text)` - Expand a submenu

### Cart
- `cy.openCartDrawer()` - Open cart drawer
- `cy.closeCartDrawer()` - Close cart drawer
- `cy.getCartCount()` - Get current cart count
- `cy.verifyCartEmpty()` - Verify cart is empty
- `cy.clearCart()` - Clear all items from cart
- `cy.updateCartQuantity(qty)` - Update item quantity

### Add to Cart
- `cy.addToCart()` - Add product to cart
- `cy.addToCartAndVerify()` - Add product and verify cart updated
- `cy.visitProduct(handle)` - Visit a product page

### HB Popup
- `cy.openHbPopup(index)` - Open HB popup for product at index
- `cy.closeHbPopup()` - Close HB popup
- `cy.addToCartFromHbPopup()` - Add to cart from popup
- `cy.selectHbPopupVariant(index)` - Select variant in popup
- `cy.updateHbPopupQuantity(qty)` - Update quantity in popup

### Header
- `cy.clickLogo()` - Click logo to go home
- `cy.hoverMegaMenu(text)` - Hover over mega menu item
- `cy.clickDesktopMenuItem(text)` - Click desktop menu item

### Checkout
- `cy.proceedToCheckoutFromDrawer()` - Checkout from cart drawer
- `cy.proceedToCheckoutFromCart()` - Checkout from cart page

### Utilities
- `cy.waitForPageLoad()` - Wait for page to fully load
- `cy.checkBrokenImages()` - Check for broken images
- `cy.checkInternalLinks()` - Verify internal links
- `cy.scrollToAndVerify(selector)` - Scroll to element
- `cy.takeNamedScreenshot(name)` - Take named screenshot

## GitHub Actions

### Triggers

The workflow runs on:
- **Push** to `main`, `master`, or `develop` branches
- **Pull requests** to `main`, `master`, or `develop` branches
- **Schedule** - Daily at 6 AM UTC
- **Manual trigger** - Via workflow_dispatch

### Test Matrix

Tests run on both viewports in parallel:
- Desktop (1280x720)
- Mobile (375x812)

### Artifacts

On test failure, the following artifacts are uploaded:
- Screenshots (`cypress/screenshots/`)
- Videos (`cypress/videos/`)

Artifacts are retained for 7 days.

## Setting Up Slack Notifications

### 1. Create a Slack Webhook

1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new app or select existing app
3. Enable "Incoming Webhooks"
4. Add a new webhook to your workspace
5. Select the channel for notifications
6. Copy the webhook URL

### 2. Add GitHub Secret

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SLACK_WEBHOOK_URL`
5. Value: Your Slack webhook URL
6. Click **Add secret**

### Notification Events

- **Failure notifications** - Sent when tests fail (not on PRs)
- **Success notifications** - Sent only for scheduled runs when all tests pass

## GitHub Secrets Required

| Secret | Description | Required |
|--------|-------------|----------|
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL for notifications | Optional (notifications won't work without it) |

## Test Schedule

| Event | Schedule |
|-------|----------|
| Daily Run | 6:00 AM UTC |
| Push to main/master/develop | On push |
| Pull Requests | On PR creation/update |

## Troubleshooting

### Tests failing due to third-party scripts

The test suite is configured to ignore errors from common third-party scripts:
- Google Analytics (gtag)
- Facebook Pixel (fbq)
- Klaviyo
- Skio

### Flaky tests

Tests are configured to retry 2 times in CI mode. If tests are still flaky:
1. Increase timeouts in `cypress.config.js`
2. Add explicit waits where needed
3. Check for race conditions in the application

### Cart state issues

Use `cy.clearCart()` in `before()` hooks to ensure clean cart state.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests locally to verify
4. Submit a pull request

## License

MIT
