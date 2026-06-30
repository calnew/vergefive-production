# Verge Five Full Platform Redesign Handoff

Use this document to redesign the Verge Five member platform pages while preserving the existing backend, member routes, scan-first business logic, and 7-module / 5-phase product structure.

## Primary Objective

Redesign the Verge Five logged-in member platform into a clean, action-first SaaS dashboard experience.

The platform should feel like:

- A business credit command center
- A scan-first workflow
- A guided approval-readiness system
- A place where members quickly see what to fix, what they can access now, and what unlocks next

The platform should not feel like:

- A long course library
- A video-first training site
- A homework-heavy module system
- A disconnected set of pages

## Design Source Of Truth

Use the uploaded Claude design package as the visual framework:

`Fintech SaaS prototype delivery (2).zip`

The key file inside that package is:

`Verge Five Platform.dc.html`

Treat that design as the source of truth for:

- App shell
- Sidebar
- Header
- Dashboard layout
- Scan page layout
- Fix page template
- Account match cards
- Full buildout page
- Support request page
- Mobile structure
- Typography
- Spacing
- Colors
- Card hierarchy

Do not redesign from scratch. Rebuild the existing platform pages using that document’s layout language.

## Current Implementation Context

The current app is a static Cloudflare Pages style site with:

- `public/` for static HTML/CSS/JS pages
- `functions/` for Cloudflare Pages Functions
- `public/Scripts/vf-redesign.js` for most scan-first interaction logic
- `public/Style/vf-redesign.css` for the main visual system

The logged-in member dashboard route is:

`/dashboard/`

The public/demo preview route is:

`/dashboard-demo/`

Production must not be changed directly. Dev branch and dev deployment are the testing path first.

## Non-Negotiable Product Rules

- Keep production untouched unless explicitly approved.
- Keep the platform as 7 modules inside 5 phases.
- Do not reintroduce 8 modules.
- Do not add Module 08.
- Do not add “Bank Funding Options” as an 8th module.
- Preserve all working backend/auth/scan/member functionality.
- Redesign the pages and flow, but do not remove the underlying business logic.
- Videos should be secondary and compact, not huge page-leading blocks.
- Every page should be action-first.
- Every member page needs an obvious way back to `/dashboard/`.
- Every “Get Help” button should route to `/support/` with the fix area/page context.

## Core Product Direction

The new direction is:

1. Member logs in.
2. Member lands on `/dashboard/`.
3. Dashboard shows:
   - Business readiness
   - Page/platform progress separately
   - Next 3 actions
   - Available account matches
   - Locked/unlock-next accounts
   - Run Scan CTA
   - Full Buildout optional path
4. Member runs the scan on `/ai-visibility-audit/`.
5. Scan result identifies the exact business-credit signals that need attention.
6. Each scan issue routes to the exact fix page.
7. Each fix page shows:
   - What is wrong
   - What to do first
   - Setup/service options
   - Proof to save
   - What this unlocks
   - Short video/training lower on page
8. Once enough items are complete, account matches become available.

## Main Navigation Routes

Sidebar navigation should include:

- Dashboard -> `/dashboard/`
- Run Scan -> `/ai-visibility-audit/`
- Fix List -> `/start-here/`
- Account Matches -> `/about-net-30/`
- Full Buildout -> `/full-buildout/`
- Support -> `/support/`

## Scan Routing Map

Use this map exactly:

- phone signal -> `/phones-and-411/`
- 411 listing -> `/phones-and-411/`
- business address -> `/business-address/`
- website/domain email -> `/website-domain-email/`
- legal/entity setup -> `/llc-vs-corporation/`
- EIN -> `/ein/`
- banking foundation -> `/bank-account/`
- bank rating -> `/bank-rating/`
- readiness criteria -> `/business-credit-criteria/`
- net 30 readiness -> `/about-net-30/`
- vendor categories -> `/office-and-cleaning/`, `/building-and-industrial/`, `/retail-and-wholesale/`
- credit cards -> `/revolving-business-credit-cards/`, `/starter-cards/`, `/general-credit-cards/`
- support/get help -> `/support/`

## Important Pages To Redesign

### `/dashboard/`

Make this the real logged-in home.

It should follow the design document exactly:

- Dark fixed left sidebar
- Sticky header
- Greeting
- Run My Scan hero card
- Explore Full Buildout card
- Business Readiness card
- Page Progress card
- Your Next 3 Actions
- Account Access
- Unlock Next
- Help CTA

Important distinction:

- Business Readiness is scan/readiness based.
- Page Progress is platform activity based.
- They should not be the same metric.

### `/dashboard-demo/`

Keep this as a public/demo preview only.

It can mirror `/dashboard/`, but it should not become the protected member source of truth.

### `/ai-visibility-audit/`

This is the actual member scan page.

Use the design document’s “Business Visibility Audit” page:

- Navy summary card
- Profile/pre-scan card
- Run Scan CTA
- Result state after scan
- Readiness score
- Detected issues
- Each issue routes to the right fix page

The page title should be:

`Business Visibility Audit`

The dashboard button can still say:

`Run My Scan`

### `/start-here/`

Convert this from a course-style start page into the member Fix List.

It should show:

- Summary of open/done fixes
- Grouped fix sections
- Impact level
- Status
- Open action
- Get help action

The goal is for members to quickly know what to do next.

### Fix Pages

Apply the same fix-page template to:

- `/phones-and-411/`
- `/business-address/`
- `/website-domain-email/`
- `/llc-vs-corporation/`
- `/ein/`
- `/bank-account/`
- `/bank-rating/`
- `/business-credit-criteria/`
- `/about-net-30/` where appropriate

Each fix page should use the design document’s compact action-first layout:

- Top action panel
- Scan finding banner
- What to fix checklist
- Do this first steps
- Recommended setup options
- Proof to save
- What this unlocks
- Next step
- Compact training/video near the bottom

Do not lead with a huge video.

### `/about-net-30/`

This should become part account-match page and part education page.

The first screen should show:

- Available Net 30 accounts
- Locked/unlock-next accounts
- Why the account is available or locked
- Required fixes/signals
- Apply/get help actions

Education can live below the action area.

### Vendor Category Pages

Routes:

- `/office-and-cleaning/`
- `/building-and-industrial/`
- `/retail-and-wholesale/`
- `/gas-fleet-and-auto/`
- `/retail-and-fleet/`
- `/high-tech-auto-vendors/`
- `/business-assets-equipment/`

These should use the account-match design:

- Account-card style frames
- Available vs locked state
- Requirements checklist
- Timing guidance
- Apply/get help CTA

### Credit Card Pages

Routes:

- `/revolving-business-credit-cards/`
- `/starter-cards/`
- `/general-credit-cards/`

These should use the same account-card system as vendors:

- Credit-card-style frame
- Status
- Why it matches
- Requirements
- Timing
- Apply/get help
- Locked cards should clearly show what needs to be completed first

### `/full-buildout/`

This is the deep path.

Keep it optional and secondary to the scan-first dashboard.

It must show:

- 5 phases
- 7 modules
- No 8th module
- Related scan issue per module
- Required fixes per module
- CTA to open the relevant fix or account page

### `/support/`

This should be a simple request flow first.

It should support:

- Prefilled fix area
- Prefilled source route
- What the member wants handled
- Priority
- Submit confirmation
- Return to dashboard
- Return to fix list

Later, saved proof/checklist progress can plug into this flow.

## Service / Setup Options To Preserve

The redesign must include real setup/service options under the relevant categories.

Examples:

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

### Legal / EIN / Bank

- Entity Type Review
- State Filing Check
- Business Name Match Review
- EIN Verification Checklist
- IRS Letter Proof Save
- EIN Identity Match Review
- Business Bank Account Checklist
- Bank Profile Match Review
- Banking Setup Guidance
- Bank Account Proof Save

## Account Logic To Preserve

Accounts are tied to readiness signals.

Examples:

- Uline -> EIN/basic profile
- Quill -> EIN + website/domain email
- Grainger -> EIN + address + banking
- Staples -> EIN + website + address
- Best Buy Business -> EIN + website + criteria
- Home Depot Commercial -> EIN + address + bank
- Lowe’s Business -> EIN + address + bank
- Capital One Spark -> bank + bank rating + criteria
- Navy Federal Business -> bank + criteria
- Chase Ink -> bank + bank rating + net 30 + criteria
- American Express Business -> bank + bank rating + net 30 + criteria
- Bank of America Business -> bank + bank rating + criteria

Design the cards so a member can tell:

- Why this is available
- Why this is locked
- What must be fixed before applying
- Whether they should apply now, wait, or get help

## Visual Requirements

Use the design document’s exact design language:

- Background: `#F1F4F9`
- Sidebar: `#0E1A2B`
- Primary blue: `#2563EB`
- Heading text: `#0F1B2D`
- Muted text: `#5B6B82`
- Card borders: `#E5EAF1`
- Success green: `#15803D`
- Amber locked state: `#B45309`
- Fonts:
  - Headings: Space Grotesk
  - Body/UI: Plus Jakarta Sans
- Cards: 16px to 18px radius
- Buttons: 9px to 12px radius
- Sidebar width: 248px desktop
- Content max width: 1180px
- Header padding: 18px 36px
- Content padding: 32px 36px 56px

## Credit Card / Vendor Card Visual Rule

All vendor and credit card items should look like uniform card frames.

Do not show plain text logos floating in boxes.

Use:

- Credit-card-style frame
- Gradient background
- Brand/name inside the card
- No chip graphic if the current direction says remove chips
- Consistent size and spacing
- Available and locked cards should use the same frame system

## Mobile Requirements

Mobile should not be a squeezed desktop layout.

On mobile:

- Dashboard should prioritize:
  - Score/readiness
  - Next action
  - Run scan
  - Available accounts
  - Get help
  - Full buildout lower down
- Sidebar should collapse or become a mobile nav.
- Buttons should remain tappable.
- Cards should not overflow.
- Text should not overlap.

## Existing Backend / Functionality Boundary

Claude should redesign the frontend structure and page layout, but should not invent a new backend.

Preserve:

- Existing routes
- Existing auth/member flow
- Existing Cloudflare Pages Functions
- Existing scan endpoint/page behavior
- Existing local/member state structure where used
- Existing support route
- Existing account match/fix logic

If a design needs data, use placeholders/data attributes that can be wired later instead of hardcoding fake member information.

Do not hardcode:

- Ray’s Construction
- Zach Turner
- Any fake EIN
- Any static member identity as the real platform value

Member name and business name should be dynamic.

## Current Working Files Of Interest

- `public/dashboard/index.html`
- `public/dashboard-demo/index.html`
- `public/ai-visibility-audit/index.html`
- `public/start-here/index.html`
- `public/phones-and-411/index.html`
- `public/business-address/index.html`
- `public/website-domain-email/index.html`
- `public/llc-vs-corporation/index.html`
- `public/ein/index.html`
- `public/bank-account/index.html`
- `public/bank-rating/index.html`
- `public/business-credit-criteria/index.html`
- `public/about-net-30/index.html`
- `public/revolving-business-credit-cards/index.html`
- `public/starter-cards/index.html`
- `public/general-credit-cards/index.html`
- `public/full-buildout/index.html`
- `public/support/index.html`
- `public/Scripts/vf-redesign.js`
- `public/Style/vf-redesign.css`

## Current Main Public Directory Routes

The site currently includes these route folders:

- `/about-net-30/`
- `/account/`
- `/admin/`
- `/affiliate-signup/`
- `/ai-visibility-audit/`
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
- `/conversational-ai-bot/`
- `/dashboard/`
- `/dashboard-demo/`
- `/downloads/`
- `/ein/`
- `/equifax-business/`
- `/feedback/`
- `/final-readiness-summary/`
- `/forgot-password/`
- `/full-buildout/`
- `/gas-fleet-and-auto/`
- `/general-credit-cards/`
- `/high-tech-auto-vendors/`
- `/home/`
- `/homeefe757a6/`
- `/llc-vs-corporation/`
- `/login/`
- `/membership/`
- `/nap-consistency-business-credit/`
- `/nap-overview/`
- `/nav-boot/`
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

Some older/generated route folders may remain. The redesign should focus on active platform routes first.

## Recommended Build Sequence

1. Rebuild shared app shell from the design document.
2. Rebuild `/dashboard/`.
3. Rebuild `/ai-visibility-audit/`.
4. Rebuild `/start-here/`.
5. Build the generic fix page template.
6. Apply the fix template to all core fix pages.
7. Build the account-match/card template.
8. Apply the account template to vendor and credit card pages.
9. Rebuild `/full-buildout/` using 5 phases / 7 modules.
10. Rebuild `/support/`.
11. Add mobile responsive layouts.
12. QA all routes and button paths.

## QA Checklist

Before returning the redesigned files:

- Dashboard loads without console errors.
- Run Scan routes to `/ai-visibility-audit/`.
- Scan issues route to correct fix pages.
- Every fix page has Back to Dashboard.
- Every Get Help button routes to `/support/` with context.
- Account cards show available and locked states.
- Dashboard Page Progress is not the same as Business Readiness.
- Member/business names are dynamic placeholders or live data hooks.
- No fake EIN is shown.
- No 8-module language appears.
- No Module 08 appears.
- Mobile view is usable.
- Text does not overlap cards/buttons.
- Existing backend routes are preserved.

## Final Instruction To Claude

Do not only make mockups. Redesign the actual page files/components so the platform can be handed back for integration and dev deployment.

Use the existing product logic as the foundation, but apply the exact design system from `Verge Five Platform.dc.html`.
