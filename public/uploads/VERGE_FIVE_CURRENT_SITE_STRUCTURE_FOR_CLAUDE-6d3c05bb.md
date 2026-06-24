# Verge Five Current Site Structure Map For Claude

This document explains how the current Verge Five site is built today so Claude can redesign the pages without guessing the structure.

Use this together with:

- `docs/VERGE_FIVE_FULL_SITE_HANDOFF_FOR_CLAUDE.md`
- `docs/CLAUDE_VERGE_FIVE_PLATFORM_REDESIGN_README.md`
- The uploaded design prototype: `Verge Five Platform.dc.html`

## Repo / App Shape

The current Verge Five project is a Cloudflare Pages static site with Pages Functions.

Main folders:

- `public/` - all static routes, CSS, JS, images, videos, manifest
- `functions/` - Cloudflare Pages Functions/API endpoints
- `docs/` - handoff, audit, planning, design notes
- `qa/` - local/headless audit scripts and summaries
- `schema/` - database/schema support files
- `tools/` - deploy/import/support tools

The deployed static output folder is:

`public/`

The Cloudflare Pages config is:

`wrangler.toml`

## Shared Frontend Files

Most pages load:

```html
<link rel="stylesheet" href="/Style/vf-redesign.css">
<script src="/Scripts/vf-redesign.js" defer></script>
```

Important shared files:

- `public/Style/vf-redesign.css` - global styling, public site styles, member page styles, dashboard styles, scan-first fix/account styles
- `public/Scripts/vf-redesign.js` - global JS, navigation helpers, member progress logic, scan-first routing/state, dashboard logic, support flow logic
- `public/Scripts/vf-vendor-library.js` - vendor library support used by some vendor/account pages
- `public/Resources/images/` - images/logos/posters
- `public/Resources/videos/` - local video files

## Current Page Pattern

Most member pages are currently generated as static HTML and follow this pattern:

```html
<!doctype html>
<html lang="en">
<head>
  metadata
  canonical
  manifest
  /Style/vf-redesign.css
</head>
<body class="vf-static-page">
  <header class="site-header">...</header>

  <section class="page-hero lesson-hero">
    <div class="section">
      <div class="crumbs">Module / Phase label</div>
      <h1 class="page-title">Page title</h1>
      <p class="page-sub">Page description</p>
      <div class="lesson-status-row">badges</div>
    </div>
  </section>

  <section class="section member-layout">
    <aside class="member-sidebar">...</aside>
    <main class="member-main">...</main>
  </section>

  <footer class="footer">...</footer>
  <script src="/Scripts/vf-redesign.js" defer></script>
</body>
</html>
```

## Current Header Pattern

Current non-dashboard pages usually have:

- `.site-header`
- `.nav`
- `.brand`
- `.nav-links`
- `.nav-actions`
- `.mobile-toggle`
- `.mobile-panel`

Header links commonly include:

- `/dashboard/`
- `/start-here/`
- `/full-buildout/#modules`
- `/starter-net-30-vendors/`
- `/business-plan-report/`
- `/account/`

The redesign should replace this member experience with the Claude app shell:

- fixed left sidebar
- sticky app header
- content max width 1180px
- action buttons: Dashboard, Get Help, Run Scan

## Current Member Lesson Layout

Most member lesson pages currently use:

- `.member-layout`
- `.member-sidebar`
- `.member-main`
- `.path-card`
- `.premium-path`
- `.current-lesson-card`
- `.next-lesson-card`
- `.lesson-nav-strip`
- `.module-section-overview`
- `.lesson-video-section`
- `.lesson-video`
- `.lesson-intro`
- `.lesson-note-panel`
- `.checklist`
- `.lesson-checklist`
- `.check-item`
- `[data-check]`
- `[data-count]`
- `[data-fill]`
- `[data-gated]`
- `[data-locked]`

The redesign should preserve the checklist/progress behavior but move the UI into the action-first fix template.

## Current Module Structure

Current baseline is 7 modules inside 5 phases.

Do not add an 8th module.

Current module concept:

1. Business Identity
   - `/phones-and-411/`
   - `/business-address/`
   - `/website-domain-email/`
2. Legal Setup
   - `/llc-vs-corporation/`
   - `/contact-list/`
   - `/ein/`
3. Banking Foundation
   - `/bank-account/`
   - `/bank-rating/`
4. Business Plan
   - `/business-plan/`
   - `/business-plan-report/`
5. Approval Readiness
   - `/equifax-business/`
   - `/comparable-credit/`
   - `/business-credit-criteria/`
6. Starter Vendor Credit
   - `/about-net-30/`
   - vendor category pages
7. Credit Tools
   - `/revolving-business-credit-cards/`
   - `/starter-cards/`
   - `/general-credit-cards/`
   - `/cd-business-loans/`

The product direction now reframes these as:

- Dashboard first
- Scan first
- Fix pages second
- Account matches when ready
- Full buildout optional/deep path

## Current Core Logged-In Routes

### Dashboard

- `/dashboard/`
- `/dashboard-demo/`

Purpose:

- `/dashboard/` should be the real logged-in home.
- `/dashboard-demo/` should be public/demo preview only.

Current redesign work has started here. The dashboard is being moved toward the Claude prototype shell.

### Scan

- `/ai-visibility-audit/`
- `/business-visibility-audit/`
- `/business-visibility-scan/`

Primary member scan route should be:

`/ai-visibility-audit/`

Current page has:

- `.ai-audit-page`
- `.visibility-audit-tool`
- `[data-member-visibility-audit]`
- `[data-audit-form]`
- `[data-run-audit="before"]`
- `[data-run-audit="after"]`
- `[data-audit-card]`
- `[data-buildout-steps]`

Redesign goal:

- Make this match the Claude “Business Visibility Audit” screen.
- Preserve scan form/result saving behavior.
- Detected issues should route to the scan routing map.

### Fix List

- `/start-here/`

Current role:

- Start page / member buildout beginning.

New role:

- Fix List.
- Shows open/done fixes, grouped by phase/category.
- Each row routes to the correct fix page.

### Core Fix Pages

These should all be rebuilt using one reusable action-first template:

- `/phones-and-411/`
- `/business-address/`
- `/website-domain-email/`
- `/llc-vs-corporation/`
- `/ein/`
- `/bank-account/`
- `/bank-rating/`
- `/business-credit-criteria/`

Current structure:

- Header
- Hero
- Sidebar module path
- Lesson nav strip
- Module overview
- Large video
- Lesson intro
- Notes
- Checklist
- Gated/locked panels

New structure:

- App shell
- Top action panel
- Scan finding banner
- What to fix checklist
- Do this first steps
- Recommended setup options
- Proof to save
- What this unlocks
- Next step
- Compact video/training lower on page

### Vendor / Net 30 Pages

Core pages:

- `/about-net-30/`
- `/starter-net-30-vendors/`
- `/office-and-cleaning/`
- `/building-and-industrial/`
- `/retail-and-wholesale/`
- `/gas-fleet-and-auto/`
- `/retail-and-fleet/`
- `/high-tech-auto-vendors/`
- `/business-assets-equipment/`

Current `/about-net-30/` includes:

- `.vendor-match-tool`
- `[data-vendor-match-tool]`
- `[data-vendor-signal]`
- `[data-vendor-score]`
- `[data-vendor-count]`
- `[data-vendor-recommendation]`
- `[data-vendor-library-search]`
- `[data-vendor-library-category]`
- `[data-vendor-match-filter]`
- `[data-vendor-match-results]`

New structure:

- Account Match page.
- Available vs locked sections.
- Every vendor should appear as a credit-card-style frame.
- Requirements/checklist should explain why it is available or locked.

### Credit Card Pages

Core pages:

- `/revolving-business-credit-cards/`
- `/starter-cards/`
- `/general-credit-cards/`

New structure:

- Same account card system as vendors.
- Cards are available, review, or locked based on readiness.
- Members should know whether to apply now, wait, or get help.

### Full Buildout

- `/full-buildout/`

New structure:

- Optional deep path.
- Must show 5 phases / 7 modules only.
- Each module links back to scan-first fixes and account matches.

### Support

- `/support/`

Current support flow is enhanced by `vf-redesign.js`.

New structure:

- Simple centered request flow.
- Prefilled fix area and route from query params.
- Priority select.
- Confirmation state.
- Buttons back to dashboard/fix list.

## Scan-First JavaScript Structure

Important logic lives in:

`public/Scripts/vf-redesign.js`

Key objects/functions:

- `vfScanFirstFixes` - fix definitions, routes, titles, service/setup options, proof items, unlocks
- `vfScanFirstOrder` - canonical fix order
- `vfScanFirstAccounts` - account eligibility definitions
- `vfScanFirstRouteMap` - route-to-fix mapping
- `vfScanFirstFixForRoute(path)` - finds fix for current route
- `vfScanFirstRouteForText(text)` - maps scan issue text to fix
- `readScanFirstState()` - reads current scan-first progress state
- `saveScanFirstState(state)` - saves progress state
- `scanFirstDashboardReadiness(state)` - readiness calculation
- `scanFirstPageProgress(state)` - page/platform progress calculation
- `renderScanFirstFixPage()` - injects scan-first fix UI on fix pages
- `renderScanFirstAccountPage()` - injects account-match UI on account/vendor/card pages
- `initSupportRequestFlow()` - support request form behavior
- `initScanFirstDashboard()` - dashboard data/render behavior

The redesign should either:

1. Preserve these data hooks/classes and restyle them, or
2. Replace the markup cleanly while keeping equivalent state hooks and route behavior.

Do not throw this logic away unless the replacement preserves the same behavior.

## Scan-First Fix Keys

Current canonical fix order:

```js
[
  "phones",
  "address",
  "website",
  "llc",
  "ein",
  "bank",
  "bankrating",
  "criteria",
  "net30"
]
```

Current important fix routes:

- `phones` -> `/phones-and-411/`
- `address` -> `/business-address/`
- `website` -> `/website-domain-email/`
- `llc` -> `/llc-vs-corporation/`
- `ein` -> `/ein/`
- `bank` -> `/bank-account/`
- `bankrating` -> `/bank-rating/`
- `criteria` -> `/business-credit-criteria/`
- `net30` -> `/about-net-30/`

## Setup Options Already Captured

The page redesign should include these kinds of setup options instead of burying them in long content.

### Phone / 411

- TurnCom360 Business Phone Setup
- Grasshopper Business Line
- Business VoIP Setup Review
- Caller ID / Business Name Match
- 411 Listing Support
- Done-For-You Phone Signal Fix

### Address

- Business Address Review
- Address Consistency Cleanup
- Business Address Setup Guidance
- Records Match Review
- Done-For-You Address Cleanup

### Website / Domain Email

- Website Setup
- Domain Email Setup
- Website Credibility Review
- Business Profile Cleanup
- Done-For-You Web Presence Setup

### Legal Entity

- Entity Type Review
- State Filing Check
- Business Name Match Review
- Entity Setup Guidance

### EIN

- EIN Verification Checklist
- IRS Letter Proof Save
- EIN Identity Match Review
- EIN Setup Guidance

### Banking

- Business Bank Account Checklist
- Bank Profile Match Review
- Banking Setup Guidance
- Bank Account Proof Save

## Account Eligibility Logic Already Captured

Current account definitions are spread across these files:

- `public/Scripts/vf-vendor-library.js` - vendor, Net 30, fleet, operational vendor, technology vendor, credit builder/profile tool library
- `public/Scripts/vf-card-library.js` - secured cards, secured credit lines, traditional business cards, corporate/no-PG cards, store cards, fleet/fuel cards
- `public/Scripts/vf-funding-library.js` - CD-secured loans, secured bank lines, SBA-backed paths, CDFI/community lenders, equipment financing, funding cautions
- `public/Scripts/vf-redesign.js` - dashboard/account-access summary list and scan-first account status logic

Complete vendor / Net 30 / operational account library currently includes:

- Crown Office Supplies
- Uline
- Quill
- Grainger
- Nav Prime / Business Boost
- eCredable Business
- CreditStrong Business
- NAMYNOT
- Creative Analytics
- Branded Apparel Club
- Coast to Coast Office Supply
- Nine to Five Essentials
- GoodNeon
- Office Garner
- The CEO Creative
- Wise Business Plans
- JJ Gold International
- NeweggBusiness
- HD Supply
- Home Depot Pro / SupplyWorks
- Strategic Network Solutions
- Summa Office Supplies
- Maverick Office Supplies
- Ohana Office Products
- Shirtsy
- Business T-Shirt Club
- Red Spectrum
- Gempler's
- FairFigure
- Growegy
- Shogun Roasting
- Amazon Business Pay by Invoice
- Staples Business
- Office Depot Business
- Wayfair Professional
- Costco Business
- Sam's Club Business
- BJ's Business
- Home Depot Commercial Account
- Lowe's Pro
- United Rentals
- BP Business Solutions
- Shell Fleet
- WEX
- Fleet One
- Universal Premium FleetCard
- Chevron Texaco Business Card
- Valero Fleet Plus
- 76 Business Fleet Card
- ARCO Business Solutions
- Ford Pro
- Capital One Spark
- American Express Business
- Citi Business
- Ramp
- Brex
- BILL Divvy
- Apple Business
- Dell Business
- Best Buy Business
- Lenovo Pro

Complete secured / card / credit-line library currently includes:

- Bank of America Business Advantage Secured
- Bank of America Business Advantage Secured Credit Line
- First National Bank Business Edition Secured Mastercard
- Valley Visa Secured Business Credit Card
- Capital One Spark Classic for Business
- Capital One Spark Cash Select
- Chase Ink Business Cash
- Chase Ink Business Unlimited
- American Express Blue Business Cash
- American Express Business Gold
- U.S. Bank Business Triple Cash Rewards
- Wells Fargo Signify Business Cash
- CitiBusiness AAdvantage
- Ramp Card
- Brex Card
- BILL Divvy Corporate Card
- Rho Corporate Card
- Mercury IO Mastercard
- Amazon Business American Express
- Sam's Club Business Mastercard
- Costco Anywhere Visa Business
- Home Depot Commercial Account
- Lowe's Business Advantage
- Dell Business Credit
- NeweggBusiness Net Terms
- Shell Small Business Card
- WEX Fleet Card
- BP Business Solutions Fuel Card
- Chevron Texaco Business Card
- Capital on Tap Business Credit Card

Complete funding / secured-loan path library currently includes:

- Bank of America Business Advantage Credit Line Cash Secured
- Bank of America Secured Business Loan
- Bank of America Secured Business Line of Credit
- Chase Business Line of Credit
- Chase SBA Express / SBA-backed line
- Local bank CD-secured business loan
- Credit union share-secured business loan
- SBA Lender Match
- SBA 7(a) loan discussion with bank
- SBA 504 fixed asset financing
- Accion Opportunity Fund
- CDFI / community lender search
- Equipment financing through current bank
- Bank relationship term loan
- Business checking relationship review
- Deposit-backed starter funding plan
- Merchant cash advance warning review
- Invoice factoring readiness check
- Business grant search as non-debt option
- SCORE funding mentor session

Dashboard/account-access summary definitions currently include:

- Uline
- Quill
- Grainger
- Office Supplies Vendor
- Fuelman Fleet
- Staples
- Best Buy Business
- Home Depot Commercial
- Lowe's Business
- Capital Starter
- Navy Federal Business
- Capital One Spark
- Brex Card
- Chase Ink
- American Express Business
- Bank of America Business
- Ramp Card

The redesigned account pages should show these as uniform card frames.

Each account needs:

- Name
- Type/category
- Status
- Requirements
- Timing guidance
- Why available or locked
- Apply/get help action

## Current Full Public Route Inventory

These route folders exist in `public/`:

- `/about-net-30/`
- `/account/`
- `/admin/`
- `/affiliate-signup/`
- `/ai-visibility-audit/`
- `/automated-underwriting-business-credit/`
- `/bank-account/`
- `/bank-rating/`
- `/blog/`
- `/building-and-industrial/`
- `/business-address/`
- `/business-assets-equipment/`
- `/business-credit-answers/`
- `/business-credit-criteria/`
- `/business-credit-readiness/`
- `/business-plan/`
- `/business-plan-report/`
- `/business-visibility-audit/`
- `/business-visibility-scan/`
- `/cd-business-loans/`
- `/checkout-success/`
- `/comparable-credit/`
- `/contact/`
- `/contact-list/`
- `/contact-usb3806186/`
- `/conversational-ai-bot/`
- `/dashboard/`
- `/dashboard-demo/`
- `/demo/`
- `/downloads/`
- `/ein/`
- `/equifax-business/`
- `/feedback/`
- `/final-readiness-summary/`
- `/forgot-password/`
- `/full-buildout/`
- `/gas-fleet-and-auto/`
- `/general-credit-cards/`
- `/hidden-gatekeepers/`
- `/high-tech-auto-vendors/`
- `/home/`
- `/homeefe757a6/`
- `/llc-vs-corporation/`
- `/login/`
- `/membership/`
- `/nap-consistency-business-credit/`
- `/nap-overview/`
- `/nav-boot/`
- `/nav-ecredable/`
- `/newpage7c157847/`
- `/newpage87229491/`
- `/newpagea5b34995/`
- `/newpagebd8ae2e6/`
- `/newpageed554e37/`
- `/office-and-cleaning/`
- `/phones-and-411/`
- `/privacy-policy/`
- `/reset-password/`
- `/retail-and-fleet/`
- `/retail-and-wholesale/`
- `/revolving-business-credit-cards/`
- `/signup/`
- `/start-here/`
- `/starter-cards/`
- `/starter-net-30-vendors/`
- `/support/`
- `/terms/`
- `/trial-roadmap/`
- `/verify-email/`
- `/website-domain-email/`
- `/whats-inside/`
- `/your-bank-rating/`

Focus the redesign on active member routes first. Older generated pages may remain but should not drive the new platform structure.

## What Claude Should Return

Claude should return:

1. Redesigned page files or components.
2. Shared layout/app shell.
3. Shared fix page template.
4. Shared account card template.
5. Updated CSS/design tokens.
6. Notes on any data hooks it expects.
7. A route-by-route checklist of what was changed.

The returned work should be ready for Codex to integrate into the real dev environment and test against the existing backend/functions.

## Key Warning

Do not make the redesign a standalone mockup only.

The goal is a framework that can replace the real page structure while preserving:

- Member auth flow
- Scan flow
- Progress/checklist behavior
- Account eligibility behavior
- Support request flow
- Existing route URLs
- 7-module / 5-phase baseline
