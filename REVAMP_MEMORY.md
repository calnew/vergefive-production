# Verge Five Revamp Memory

This file is the working memory for the Verge Five platform revamp so the project can be resumed without losing context.

## Project

- Brand: Verge Five
- Platform purpose: paid/member business credit education platform.
- Deployment target: Cloudflare Pages only.
- Current project root: `D:\Cowork\veregefive\vergefive_cloudflare`
- Public site directory: `D:\Cowork\veregefive\vergefive_cloudflare\public`
- Cloudflare Pages project: `vergefive`
- Cloudflare account used previously: `Turncomvoice@gmail.com`
- Cloudflare account ID: `7e010843ac0f3d614b1b553011f47784`

## Current Live Deployment

Latest deployment from this workstream:

- `https://35e98a39.vergefive.pages.dev`

Latest trial/test-drive flow update:

- Trial users now have access to `/trial-roadmap/`.
- `/trial-roadmap/` shows the locked 8-module path, marks Module 1 phone/Business 411 as previewed, and reuses the sample readiness engine for limited Net 30, credit card, and report previews.
- `/trial-roadmap/` is intentionally public-safe now, so the Module 1 preview handoff does not dead-end at login if a session cookie is missing or the user is on a different Pages preview domain.
- Sample vendor/card preview cards now open a locked-detail modal instead of exposing full criteria.
- `/phones-and-411/` now shows a completion card after the checklist is finished, sending trial users to `/trial-roadmap/`.

Latest homepage replacement:

- `public\index.html` was replaced with the provided `C:\Users\calne\Downloads\Verge Five Homepage.html` design.
- The placeholder `V5` mark was replaced with the real `/Resources/images/verge5-logo-mark.png` logo in the header and footer.
- Placeholder links were converted to real platform routes: `/demo/`, `/blog/`, `/login/`, `/membership/`, `/support/`, `/privacy-policy/`, `/terms/`, and `/contact-usb3806186/`.
- Monthly/annual access links now point to `/membership/?plan=monthly` and `/membership/?plan=annual`.
- Added mobile responsive CSS to the standalone homepage.
- Wired the homepage visibility scan button to `/api/visibility-scan`.

Latest homepage palette update:

- Homepage-only embedded CSS in `public\index.html` was realigned to the interior platform palette.
- Hero now uses `#0E2F5C` to `#154A8E`.
- Primary CTAs now use `#1E7AE0` with `#185FA5` hover.
- Secondary on-dark CTA is now white with navy text.
- Hero underline accent changed from red to bronze `#D4A03C`.
- Secondary/manifesto section changed from cream to `#EEF3F9` with `#D6E0EC` border.
- Hero eyebrow and trust checkmarks now use `#5DB4F0`; hero body copy uses `#CFE0F2`.
- Denied receipt card artwork was preserved with its original warm paper/red stamp treatment.

Latest video fix:

- `public\Resources\videos\bank-rating-lesson.webm` was regenerated after fixing the "Why it matters" / bank-rating title scene so the blue label no longer overlaps the headline and the right-side gauge has room.
- Source script: `tools\create-bank-rating-video.js`
- QA used source-rendered frame checks at 1, 8, 15, 22, 29, and 36 seconds before rerendering the WebM.
- Deployed in `https://35e98a39.vergefive.pages.dev`; direct video URL returned HTTP 200 with `video/webm`.

Latest report print fix:

- `public\Scripts\vf-redesign.js` now uses shared branded report styles for popup/download/print reports and preserves color in print media.
- `public\business-plan-report\index.html` no longer marks the mid-platform report as the final summary.
- QA captured screen and print-media screenshots for `/business-plan-report/`; printed report shows the navy header, color cards, progress bar, readiness pills, and styled next actions instead of a flattened black-and-white document.

Latest Module 5 video fix:

- Regenerated `public\Resources\audio\comparable-credit-narration.wav` with the Emma voice and pronunciation-safe settings for "comparable credit."
- Rerendered `public\Resources\videos\comparable-credit-lesson.webm`.
- The cut-off blue "personal credit finance program" visual was removed from the video render; the video now uses `public\Resources\images\comparable-credit-thumbnail.png`.
- Playback QA screenshot confirmed the comparable-credit image and lesson text render correctly.

Latest Module 7 video fix:

- Updated `tools\source-transcripts\nav-boot.clean.txt` so narration says "Nav dot com" and "E Credible" naturally instead of spelling out "N A V" or sounding like "incredible."
- Updated the `nav-boot` entry in `tools\existing-video-replacements.json` so visual slide labels display `NAV.com`, `NAV Boost`, and `eCredable`.
- Regenerated `public\Resources\audio\nav-boot-source-narration.wav` with the Emma voice and rerendered `public\Resources\videos\nav-boot-recreated.webm`.
- Playback QA frame confirmed the updated Module 7 Lesson 2 video renders correctly.

Important note:

- Custom domains `vergefive.com` and `www.vergefive.com` previously showed as pending in Cloudflare Pages domain checks. The Pages deployment URLs are the reliable review URLs until the custom domain binding is fully active.

Latest UX/content remediation baseline:

- The FlexDesk-transferred UX/content/flow audit is preserved at `docs\flexdesk-transferred-audit-baseline-2026-05-22.md`.
- The working remediation checklist is `UX_CONTENT_REMEDIATION_PLAN.md`.
- Stage 1 fixes completed: final summary encoding, legacy URL redirects in middleware and `_redirects`, `Continue Buildout` header CTA, and dashboard `Start Module` labels.
- Stage 2 fixes completed: repeated generic lesson intro copy replaced with lesson-specific plain-English explanations; proof notes added above lesson checklists; checklist helper copy now tells members to save proof; progress-save note added.
- Stage 3/4 fixes started: Business 411, Net 30, Low 5, personal guarantee, CD-secured loans, and bureau terms have been clarified; business bureau mini glossary added; dashboard current-step card added; vendor card reporting language changed to `Verify with vendor`; downloads/support/AI pages now use specific next-action examples.
- Local static link check scanned 82 HTML files and found 0 missing internal href targets.

Latest member persistence bridge:

- `public\Scripts\vf-redesign.js` now syncs logged-in member state against the existing Cloudflare Pages Functions API.
- The front end loads `/api/member/profile` and `/api/member/progress`, merges server data with browser `localStorage`, and keeps local storage as the offline fallback.
- Business profile intake changes now save to `/api/member/profile`.
- Checklist/resume progress continues saving to `/api/member/progress`.
- Vendor, card, and funding matcher selections now save as readiness signals through `/api/member/progress`.


Latest password reset backend:

- Added D1 table `password_reset_tokens` to `schema\member-progress.sql` and applied the schema to the remote `vergefive-members` database.
- Added `/api/auth/request-password-reset` and `/api/auth/reset-password` Pages Functions.
- Added `/forgot-password/` and `/reset-password/` pages and linked password reset from `/login/`.
- Password reset emails use the existing Resend configuration when `RESEND_API_KEY` and `EMAIL_FROM` are configured; optional `PASSWORD_RESET_DEBUG_LINKS=true` can show reset links during private QA.

Latest backend environment check:

- Remote D1 `vergefive-members` is reachable and contains the expected member tables.
- Production Pages secrets currently exist for `ADMIN_EMAILS`, `SITE_URL`, `STRIPE_PRICE_ID`, `STRIPE_PRICE_ID_ANNUAL`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`.
- Still missing external values before hardened production access: `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, and `EMAIL_FROM`.
- `/api/config` now exposes safe boolean readiness flags for Turnstile, email provider, email verification, and password-reset debug links without exposing secret values.

Latest backend preview deployment:

- Backend/password-reset work was deployed to Cloudflare Pages preview branch `backend-progress`.
- Preview URLs: `https://backend-progress.vergefive.pages.dev`, original build `https://3841aaee.vergefive.pages.dev`, latest config build `https://d4915a89.vergefive.pages.dev`.
- Verified preview routes: `/forgot-password/`, `/reset-password/`, `/login/`, and `/api/config` returned HTTP 200.
- `/api/config` preview response confirmed preview environment secrets are not configured yet: Turnstile, email provider, Stripe secret, Stripe monthly, Stripe annual, and Stripe webhook flags all return `false`.
- Member persistence preview QA passed with a temporary remote D1 user: profile save, lesson progress/resume save, vendor signal save, reload, and cleanup all succeeded.
- Report snapshot preview QA passed with an active temporary remote D1 member: report save, report list, trial gating, and cleanup all succeeded.
- Authenticated Cloudflare mobile audit passed on preview branch ackend-progress: Phone/411, Business Address, Approval Criteria, and Net 30 member pages loaded .member-layout at 390px with a temporary active QA member; cleanup confirmed 0 remaining qa-mobile-* users.
- Account report history preview QA passed: an authenticated active temporary member saved a report, loaded it through the reports API, and saw the account report-history panel on /account/; cleanup confirmed 0 remaining qa-account-* users.
- Password reset request endpoint returned the generic success message for an unknown email, preserving account enumeration safety.
- Password reset preview QA passed with a temporary remote D1 user: register, reset request, token lookup, reset confirmation, new-password login, and cleanup all succeeded.
- Stripe checkout preview QA found preview environment secrets are incomplete: checkout APIs returned missing monthly/annual price ID errors on `backend-progress`; temporary checkout QA user cleanup succeeded.
## Main Product Direction

This is not a basic website. It is a paid member platform that teaches business owners how to build business credit in the correct order.

Every member lesson should feel premium and useful:

1. Clear lesson navigation and progress bar.
2. Video at the top.
3. Valid topic-specific image under the video in the "Why this matters" section.
4. Premium special note/warning/resource section.
5. Recommended resources or official links when useful.
6. Action checklist.
7. Download/print progress report block.

Tone of content:

- Plain, direct, educational.
- Warn members before they make mistakes.
- Explain why each step matters for lenders, banks, bureaus, vendors, and applications.
- Avoid guaranteed approval claims.
- Keep legal/tax language cautious and recommend professional advice where appropriate.

## Design System Decisions

Primary style:

- Premium, professional, dark navy accents.
- Avoid childish colors.
- Use clean white cards, subtle blue/gold accents, restrained shadows.
- Reuse the premium lesson sidebar and lesson navigation pattern throughout all lessons.
- Lesson images should be real, useful, and topic-specific, not cropped banner graphics or tiny logos.

Important CSS file:

- `public\Style\vf-redesign.css`

Important JS file:

- `public\Scripts\vf-redesign.js`

Useful design tooling command:

```powershell
npx skills add https://github.com/anthropics/skills --skill frontend-design
```

Reusable features added:

- Premium lesson sidebar.
- Lesson progress strip.
- Special note panels.
- Vendor strategy panels.
- Proof/report panel.
- Download/print progress report behavior.

## Lesson Video System

All member lessons now have videos.

There are two video types:

1. New narrated explainer videos for lessons that had no original video.
2. Recreated videos for lessons that already had original MP4s, using transcribed wording from the original videos.

Video output format:

- WebM
- 1280x720
- Natural neural voice
- Clean template with no overlays blocking main text
- Stored in `public\Resources\videos`

Natural voice:

- HyperFrames/Kokoro voice used: `af_nova`

Video tools/scripts:

- `tools\lesson-video-data.json`
- `tools\create-lesson-videos.js`
- `tools\existing-video-replacements.json`
- `tools\create-existing-replacement-videos.js`
- `tools\transcribe-source-videos.py`

Generated narration/transcript folders:

- `tools\narration`
- `tools\source-transcripts`
- `public\Resources\audio`

Temporary source MP4s were downloaded for transcription into `tools\source-videos`, then removed after use to avoid keeping huge files.

## Recreated Original Videos

Original MP4 lessons were transcribed and recreated in the new style:

- Business phone setup
- Business 411 directory
- Business address
- Website and domain email
- EIN from IRS
- Business bank account
- Business plan
- Net 30 business credit
- Nav and eCredable fast track
- Revolving business credit cards

All of these pages now point to `*-recreated.webm` files instead of the original remote MP4s.

## New Videos Added For Missing Lessons

New narrated videos were created for:

- LLC vs Corporation
- Secretary of State contact list
- Business bank rating
- Your bank rating worksheet
- Business credit bureaus
- Comparable credit
- 12-point business credit criteria
- CD-secured business loans

## Lesson Images

Every member lesson was audited for the image underneath the video.

Weak banner-style images were replaced with valid topic-specific pictures.

Updated image examples:

- Net 30: `office_table_set_computer_cup_notebook.jpg`
- Bank rating / bank rating worksheet / 12-point criteria: `credit-readiness-desk.png`
- Credit bureaus / comparable credit: `business-credit-advisor.png`
- CD-secured loans / entity/legal pages: `pexels-photo-3153201-2880w.jpeg`
- Phone and 411: `Biz Phone.jpg`

## Important Completed Page Work

### Blog Buildout

Created a full Verge Five blog based on search/research themes around starting a business and building business credit.

Implementation notes:

- Blog hub: `public\blog\index.html`
- 25 individual blog posts live under `public\blog\<slug>\index.html`
- Each post includes:
  - SEO title and description
  - BlogPosting JSON-LD
  - Research/source links
  - Readiness checklist
  - Related posts
  - CTA to `Get access` without listing any price
- Blog topics cover:
  - Business credit build order
  - LLC vs corporation
  - EIN timing and EIN-only myths
  - Business address, phone, 411, website, and domain email
  - Business bank accounts and bank rating
  - DUNS vs EIN
  - Net 30 vendors and PAYDEX
  - Business credit bureaus, comparable credit, denials, scams, and readiness
- `Blog` was added to the main navigation across site pages.
- `sitemap.xml` now includes the blog hub plus all 25 article URLs.
- QA confirmed:
  - 25 post folders
  - 25 hub cards
  - BlogPosting schema on posts
  - No price language in CTAs
  - No missing internal blog links
  - No horizontal overflow on sampled desktop pages

### Starter Vendor Credit Readiness Matcher

Module 6 page `public\about-net-30\index.html` was upgraded from a simple Net 30 lesson/resource page into an interactive vendor readiness matcher.

Current behavior:

- Member checks which setup signals they already have:
  - Entity
  - EIN
  - Business phone
  - Business 411 listing
  - Business address
  - Website
  - Domain email
  - Business bank account
  - DUNS / bureau profile
  - Existing tradelines
  - 90+ days in business records
  - Personal guarantee acceptable
- Tool calculates a readiness percentage.
- Vendors are grouped as:
  - Ready now
  - Almost ready
  - Build first
- Each vendor card shows:
  - Category
  - Required prerequisites
  - Recommended signals
  - Reporting/review note
  - Match note explaining what is missing
  - Link to the relevant vendor category page
- Vendor data lives client-side in `public\Scripts\vf-redesign.js`.
- Styling lives in `public\Style\vf-redesign.css`.
- QA confirmed:
  - JavaScript syntax passes
  - Vendor cards render
  - Score updates when signals are selected
  - Desktop and mobile have no horizontal overflow

Expanded vendor library update:

- Added `public\Scripts\vf-vendor-library.js`.
- The matcher now uses 61 compact vendor cards instead of the original 18 seeded options.
- Added vendors/tools from current research, including Crown Office Supplies, NAMYNOT, eCredable, CreditStrong, Creative Analytics, Branded Apparel Club, Coast to Coast Office Supply, Nine to Five Essentials, GoodNeon, Office Garner, The CEO Creative, Wise Business Plans, JJ Gold, NeweggBusiness, HD Supply, Strategic Network Solutions, Summa Office Supplies, Maverick Office Supplies, Ohana Office Products, Shirtsy, Business T-Shirt Club, Red Spectrum, Gempler's, FairFigure, Growegy, Shogun Roasting, fleet cards, retail/wholesale vendors, and higher-level business credit card options.
- Compact card UX:
  - Small cards show status, vendor name, category, and missing prerequisite count.
  - Clicking a card opens a larger detail modal with full prerequisites, reporting/review note, match note, source note, and vendor link.
  - Added search and category filtering.
- Important data rule:
  - Where reporting details are not from an official vendor page, the UI says to verify current reporting/requirements before applying.
  - Avoid guaranteed approval language.
- Sources used include current Nav, NAMYNOT, Crown Office Supplies, FairFigure, and vendor pages such as NeweggBusiness.

### Nav and eCredable Fast Track

Page: `public\nav-boot\index.html`

Update:

- Added eCredable Business Lift as a full recommended resource card alongside Nav Business Boost.
- Added outbound resource links:
  - Nav: `https://www.nav.com/`
  - eCredable Business: `https://business.ecredable.com/`
- Added deeper explanation section titled `How eCredable fits`.
- The explanation clarifies:
  - eCredable may help report eligible recurring payments or vendor bills.
  - Members must verify eligible payments, bureau coverage, exact business name requirements, and reporting timing.
  - It is not a shortcut around EIN, phone, address, website, banking, and vendor readiness.
- Updated checklist item to compare Nav and eCredable before choosing a reporting option.

### 8-Module Curriculum Consolidation

The member-facing curriculum has been consolidated from 17 equal lesson cards into 8 clearer modules:

1. Business Identity
2. Legal Setup
3. Banking Foundation
4. Business Plan
5. Approval Readiness
6. Starter Vendor Credit
7. Credit Tools
8. Bank Funding Options

Implementation notes:

- Dashboard page `public\homeefe757a6\index.html` now presents the 8-module buildout instead of 17 separate lesson cards.
- Existing lesson pages remain available as sections inside the 8 modules, preserving all videos, images, resources, and checklists.
- All member lesson sidebars now show the 8-module path instead of the old 5-step path.
- All lesson pages now include a module overview panel listing the sections inside that module.
- Lesson top navigation now says `Module X of 8` and uses section/module-aware previous and next buttons.
- Header navigation label changed from `Step 1` to `Modules`, and Readiness now points to the Approval Readiness module.
- Visual QA was done locally at desktop and mobile sizes; no horizontal overflow was found on the dashboard, Module 1, or Module 2 test pages.

### Business Phone and 411

Page: `public\phones-and-411\index.html`

Requirements handled:

- Videos split into Step 1A and Step 1B.
- Step 1A: business phone setup.
- Step 1B: add number to business 411 directory.
- TurnCom360 shown first, then RingCentral, then Grasshopper.
- TurnCom360 positioned as done-for-you service.
- RingCentral and Grasshopper positioned as DIY setup.
- Price badges added.
- Buttons/cards aligned.
- Phone-related image updated.

### Business Address

Page: `public\business-address\index.html`

Requirements handled:

- Premium warning section about mailbox-only/virtual addresses.
- Explains that address must be usable as a real business location when possible.
- Warns about blacklist/flag risk if it looks like PO box, post office, or mass virtual address.
- Recommends checking Google Maps and using commercial-looking address.
- Premium dark blue/gold styling.
- Sidebar made clearer for Lesson 2.

### Website and Domain Email

Page: `public\newpage87229491\index.html`

Requirements handled:

- TurnCom360 website option added/emphasized as done-for-you.
- DIY website options discussed as needing domain, website build, certificate/email setup, etc.
- Website/business email positioned as important for loan/application credibility.

### LLC vs Corporation

Page: `public\newpage7c157847\index.html`

Requirements handled:

- Real picture added under Why this matters.
- LLC vs Corporation section added.
- Caveats section added for taxes, ownership, registered agent, compliance, liability, investors, and professional advice.
- Recommended filing resources added: CorpNet, Bizee, BizFilings.
- Official filing offices were moved out of this lesson.

### Secretary of State Contact List

Page: `public\contact-list\index.html`

Requirements handled:

- Official filing offices moved here.
- Added state dropdown with all 50 states plus DC.
- Selecting state shows official filing/search office and link.
- Real image added.

## Vendor Pages

Vendor category pages now have a strategy panel with:

- Real image.
- Application strategy.
- Rules for how to use the category without hurting the profile.

Updated vendor pages include:

- Starter Net 30 Vendors
- Starter Business Cards
- General Business Credit Cards
- Building and Industrial Vendors
- Gas, Fleet, and Auto Vendors
- Business Assets and Equipment
- Office and Cleaning Vendors
- Retail and Wholesale Vendors
- Retail and Fleet Vendors
- High Tech and Auto Vendors

## Progress Report Feature

Progress reporting is now centralized instead of being shown on every lesson.

Members can:

- Print a styled member-safe progress report.
- Download the same styled report layout as an HTML file.

Current structure:

- Individual lesson pages no longer show report/download controls.
- Module 4 / Business Plan now has Section 2 at `public\business-plan-report\index.html`.
- `/business-plan/` points to `/business-plan-report/` before Module 5.
- The member navigation `Report` link points to `/business-plan-report/`.
- The final readiness summary still has report controls for the end-of-platform summary.
- Report downloads now use the styled `reportHtml()` layout instead of the old plain text download.

Report generation still starts from checklist/profile state in the browser, and authenticated active members now save report snapshots to D1 through /api/member/reports.

Future idea:

- Once real authentication/member storage exists, progress reports should be saved to the member account and downloadable as a full readiness report.

## Business Credit Card Matcher

Module 7 Section 2 (`/revolving-business-credit-cards/`) was upgraded to match the starter vendor credit experience.

Module 7 should be displayed as `Credit Tools / Credit Cards` throughout the platform. The shared redesign script applies the label consistently across path cards, module headers, and progress labels.

What changed:

- Added `public/Scripts/vf-card-library.js` with 30 researched card/credit options.
- Card types include secured business cards, traditional business cards, corporate/no-PG charge cards, store/project cards, technology terms, and fleet/fuel cards.
- The page now upgrades into an interactive readiness matcher with 14 member signals:
  - Legal entity
  - EIN
  - Business phone
  - Valid business address
  - Website
  - Domain email
  - Business bank account
  - 90+ days in records
  - Existing vendor tradelines
  - Good personal credit
  - Personal guarantee acceptable
  - Deposit available
  - Revenue/cash flow showing
  - Need no-PG corporate card
- Status language mirrors the vendor matcher:
  - Ready now
  - Almost ready
  - Do not apply yet
- Red warning language is intentional: "Do not waste an application."
- Detail modal opens each card with prerequisites, recommended signals, reporting/review note, source note, and issuer link.

Research sources used included official issuer/product pages and current card roundups:

- Bank of America Business Advantage Secured
- FNBO Business Edition Secured Mastercard
- Valley secured business credit card
- Chase Ink cards
- American Express business cards
- Capital One Spark cards
- Ramp, Brex, BILL Divvy, Rho, and Mercury corporate card information
- Store/fleet/technology card pages for Amazon, Sam's Club, Costco, Home Depot, Lowe's, Dell, NeweggBusiness, Shell, WEX, BP, and Chevron Texaco

QA artifacts:

- `qa/qa-business-cards-matcher.png`
- `qa/qa-business-cards-matcher-full.png`
- `qa/qa-business-cards-mobile.png`
- DOM check confirmed 30 card buttons, matcher present, old recommended-options heading removed, and warning language present.

## Bank Funding Matcher

Module 8 Section 1 (`/cd-business-loans/`) was upgraded to the same compact matcher pattern.

What changed:

- Added `public/Scripts/vf-funding-library.js` with 20 researched funding paths/resources.
- Funding paths include:
  - CD-secured loans
  - Cash-secured business lines
  - Secured bank lines
  - SBA-backed lending paths
  - Local bank and credit union secured options
  - CDFI/community lending
  - Equipment financing
  - Receivables financing
  - Non-debt and advisory resources
  - High-cost funding caution path
- The Module 8 page now upgrades into an interactive readiness matcher with 16 member signals:
  - Legal entity
  - EIN
  - Valid business address
  - Business bank account
  - Bank relationship started
  - 3-6 months bank statements
  - Cash reserve/CD funds
  - Revenue/cash flow
  - 2+ years in business
  - Good personal credit
  - Tax returns/financials
  - Collateral
  - Funding purpose/plan
  - Existing tradelines
  - No recent negatives
  - Personal guarantee acceptable
- Status language mirrors the vendor/card matchers:
  - Ready now
  - Almost ready
  - Do not apply yet
- Detail modal opens each funding path with required prerequisites, recommended signals, source notes, and the resource/lender link.

QA artifacts:

- `qa/qa-module8-funding-matcher-full.png`
- `qa/qa-module8-funding-mobile.png`
- DOM check confirmed 20 funding buttons, matcher present, old recommended-options heading removed, and warning language present.

## Nav / eCredable Video Pronunciation Fix

The Nav/eCredable source transcript had bad wording:

- `nav.com` was likely being pronounced as separate awkward words.
- `incredible.com`, `the incredible business lift`, and `Incredibles services` were incorrect.

Fix applied:

- Updated `tools/source-transcripts/nav-boot.clean.txt`.
- Speech text now uses `N A V dot com` for pronunciation.
- Brand wording now uses `eCredable` and `eCredable Business Lift`.
- Regenerated `public/Resources/audio/nav-boot-source-narration.wav` with HyperFrames TTS voice `af_nova`.
- Rerendered `public/Resources/videos/nav-boot-recreated.webm` using the existing lesson video generator.

## Member Progress Report Privacy Update

The download/print report was changed so members do not export the lesson plan, lesson checklist text, vendor strategy, or proprietary training content.

What changed:

- `Download report` now creates `verge-five-member-progress-report.html` using the same styled report layout as print.
- The report includes:
  - Generated date/time.
  - Current module/page location.
  - Current page completion count and percentage.
  - Business profile snapshot.
  - Count of completed business profile items.
  - A note that lessons and platform training content remain inside Verge Five.
- The report no longer includes checklist item names or lesson instructions.
- `Print report` now opens a separate report-only print window instead of printing the whole lesson page.
- The proof panel copy was updated to say `member progress snapshot`.

Step 1 intake:

- Added a `Business profile setup` panel at the top of `/phones-and-411/`.
- It stores member-entered profile data in browser localStorage under `vf-business-profile`.
- Fields:
  - Business legal name
  - Entity type
  - Formation state
  - Business phone
  - Business address
  - Website
  - Domain email
  - Business bank account opened
  - Business 411 listing completed
  - Business bureau profile checked
  - Starter tradelines started
  - Funding reserve started

QA artifacts:

- `qa/qa-business-profile-intake.png`
- `qa/qa-member-progress-report.txt`
- Browser QA confirmed the downloaded report includes business progress but does not include lesson-plan/checklist content.

## Member Resume / Backend Tracking Status

Current implementation:

- The static Cloudflare Pages build tracks member progress in browser `localStorage`.
- Same-browser resume is supported with `vf-last-location`; the dashboard can show `Pick up where you left off`.
- The progress report now includes more insight:
  - Overall readiness stage.
  - Platform sections started.
  - Business profile completion.
  - Vendor, card, and funding readiness signal counts.
  - Likely qualification path statuses.
  - Recommended next actions.
- The report still avoids exposing lesson plans, checklist wording, vendor strategy details, or proprietary lesson content.

Important production note:

- A true login backend is not currently present in the static build.
- Cross-device resume, logout/login persistence, admin visibility, and server-side report history require an auth/database backend.
- Recommended backend plan is documented in `BACKEND_PROGRESS_PLAN.md`.
- Starter Cloudflare D1 schema is documented in `schema/member-progress.sql`.

## Mobile QA Pass

Mobile hardening was added to the shared stylesheet and deployed.

Checked at 390px mobile viewport:

- Homepage
- Member dashboard
- Business phone lesson
- Business address lesson
- Starter vendor credit matcher
- Revolving business credit card matcher
- Final readiness summary/report page
- Blog hub
- Blog article

Results:

- No horizontal overflow detected on tested page types.
- Member lesson pages now show the main lesson content before the program path/sidebar on mobile.
- Vendor modal, credit card modal, report buttons, and mobile menu were checked with no horizontal overflow.

Latest mobile deployment preview:

- `https://5f95f62d.vergefive.pages.dev`

## Homepage Platform Preview

Added a homepage section directly underneath the hero that previews the member platform value:

- Net-30 account readiness with example statuses:
  - Ready to review
  - Build first
  - Do not apply yet
- Credit tools / credit card readiness with example paths:
  - Secured card
  - Business card
  - No-PG / corporate
- Purpose of the section:
  - Show visitors that Verge Five helps them see what they qualify for.
  - Explain what is missing before they apply.
  - Position readiness matching as a major platform draw.

## Homepage Conversion Update / AI Visibility Audit

The homepage was strengthened for skeptical buyers who have already been burned trying to build business credit.

Changes:

- Hero message updated visually through `vf-redesign.js`:
  - `Stop wasting business credit applications before your company is ready`
  - Focuses on knowing what to fix, what to wait on, and which path makes sense.
- Added a dark pain-point section:
  - Wrong phone signal.
  - Address problems.
  - Records do not match.
  - Applications too early.
- Added AI visibility audit preview:
  - Members run a prompt before starting.
  - Members run it again after the buildout.
  - Positioned as public-facing signal review, not a bureau/lender guarantee.
- Pricing section is visually reframed as access to the decision system instead of showing fixed pricing.

New member tool:

- Page: `/ai-visibility-audit/`
- File: `public/ai-visibility-audit/index.html`
- Includes:
  - Before prompt.
  - After prompt.
  - Copy buttons.
  - Caveat that AI cannot confirm private credit bureau files, bank underwriting, or lender databases without verified user-provided data.
- Dashboard now injects an `AI Visibility Audit` member tool card.
- Downloads page injects a card linking to the prompt.

## Public Business Visibility Scan

Added a front-end lead magnet on the homepage:

- Section title: `Run a free business visibility scan.`
- Supports `Before` and `After` modes.
- Required:
  - Business name
- Optional/basic signals:
  - State
  - Website
  - Business phone
  - Commercial address in place
  - Domain email in place
  - 411 or public directory listing
  - State/entity record exists
- Produces a score from 1 to 5:
  - 1: Not visible yet
  - 2: Very limited visibility
  - 3: Partially visible
  - 4: Visible, but needs review
  - 5: Strong visibility
- Saves local browser results under:
  - `vf-public-visibility-scan:before`
  - `vf-public-visibility-scan:after`

Important limitation:

- The scan now calls `POST /api/visibility-scan`.
- Function file: `functions/api/visibility-scan.js`.
- If `BRAVE_SEARCH_API_KEY` or `SERPAPI_API_KEY` is configured, the endpoint performs a lightweight public web lookup and returns score/findings/red flags/evidence.
- If no search key is configured, the endpoint returns a basic entered-signal score.
- Optional Cloudflare Workers AI binding `AI` can provide an AI recommendation when configured.
- Setup notes are in `VISIBILITY_SCAN_SETUP.md`.

## Existing Platform Video Rebuild - May 12, 2026

Rebuilt the 10 existing-platform source videos as clean Verge Five `.webm` lesson videos so the old platform watermark is no longer used.

Rebuilt files:

- `public/Resources/videos/about-net-30-recreated.webm`
- `public/Resources/videos/bank-account-recreated.webm`
- `public/Resources/videos/business-address-recreated.webm`
- `public/Resources/videos/business-plan-recreated.webm`
- `public/Resources/videos/ein-recreated.webm`
- `public/Resources/videos/nav-boot-recreated.webm`
- `public/Resources/videos/newpage87229491-recreated.webm`
- `public/Resources/videos/phones-and-411-phone-recreated.webm`
- `public/Resources/videos/phones-and-411-411-recreated.webm`
- `public/Resources/videos/revolving-business-credit-cards-recreated.webm`

Pronunciation/source transcript cleanup completed before regeneration:

- `USPS` changed to `United States Postal Service`.
- `EIN`, `EINs`, `IRS`, `FCC`, `PIN`, `NAV`, and `411` adjusted for spoken pronunciation.
- `listyourself.net` changed to `list yourself dot net`.
- `Net30` changed to `net thirty`.
- A few confusing transcript phrases were clarified while preserving the original lesson meaning as closely as possible.

Rendering notes:

- Narration WAV files were regenerated with the same natural voice used for the newer lessons.
- The WebM render pass created the visual lesson videos.
- FFmpeg was used afterward to explicitly mux each regenerated WAV narration track into its corresponding WebM file.
- Final verification confirmed video stream dimensions at `1280x720` and non-silent audio tracks by `volumedetect` around `-21 dB`.

Follow-up edits:

- Business Address video was rewritten and regenerated to emphasize the virtual-address rule: the address should be a real commercial location where the owner could realistically sit with a laptop, work, and meet a client. Mailbox-only, P.O. box, postal store, or mass mail receiving addresses can get flagged.
- Business Address page warning copy now uses the same "laptop test" and Google Maps commercial-building check.
- Module 1 / Phone and 411 layout was changed into a clearer two-step process:
  - Step 1A phone setup video remains full-width at the top.
  - Step 1B Business 411 walkthrough was moved below the checklist.
  - Step 1B uses the original screenshot-style MP4 walkthrough from R2 because it shows the actual 411 directory process more clearly than the recreated explainer.
- Business profile setup intake was removed from Module 1 Section 1 and moved to the dashboard/pre-module setup area. It now appears as `Pre-module setup` before members start Module 1.

## Full Generated Video Style Rebuild - May 13, 2026

Standardized the generated Verge Five lesson video set for voice, volume, and visuals.

Scope:

- Rebuilt all 18 generated `.webm` lesson videos.
- Regenerated narration with the same British female voice: `bf_emma`.
- Added a new rebuild script: `tools/rebuild-all-videos-premium.js`.
- Updated the video layout so each generated lesson includes the relevant lesson image/poster while the narration plays, plus slide text and the Verge Five progress bar.
- Re-muxed every generated WebM with the regenerated WAV narration and `loudnorm` audio normalization.

Audio result:

- Previous generated lesson videos were inconsistent:
  - Some recreated videos were around `-21 dB`.
  - Some newer lesson videos were around `-27 dB` and sounded low.
- Final generated video set now verifies around `-17 dB` mean volume, making the voice louder and more consistent.

Pronunciation cleanup included:

- `L L C`
- `E I N`
- `N S F`
- `certificate-of-deposit secured`
- `twelve-point`
- Existing prior fixes for `United States Postal Service`, `F C C`, `P I N`, `N A V dot com`, `net thirty`, and `Business four one one`.

Important exception:

- Module 1 Step 1B still uses the original R2 MP4 walkthrough for Business 411 because the owner specifically wanted the screenshot-style directory walkthrough restored there. That MP4 is not part of the generated WebM voice/style batch.

## NAP Pre-Module Video Voice Fix - May 19, 2026

- Investigated the NAP pre-module video voice mismatch.
- Confirmed the standardized generated lesson voice is HyperFrames/Kokoro `bf_emma`, not Windows Speech `Microsoft Zira Desktop`.
- Regenerated `public/Resources/audio/start-here-nap-overview.wav` with `bf_emma`.
- Rebuilt `public/Resources/videos/start-here-nap-overview.webm` from the corrected narration.
- Rechecked the resource-path frame to confirm the lettering no longer overlaps and the video still says to choose from the vendor list below instead of naming a specific provider in the narration.

## Step 1A Business Phone Video Closing Update - May 19, 2026

- Kept the original Step 1A business phone setup narration content and voice style.
- Added a closing paragraph telling members who do not have a business phone number yet to choose from the vendors below because those options support proper business phone setup and registration.
- Updated `tools/source-transcripts/phones-and-411-phone.clean.txt`.
- Updated the final slide in `tools/existing-video-replacements.json` to match the vendor guidance.
- Regenerated `public/Resources/audio/phones-and-411-phone-source-narration.wav` with HyperFrames/Kokoro `bf_emma`.
- Rebuilt `public/Resources/videos/phones-and-411-phone-recreated.webm`.
- Moved the Module 1 Section 1 action checklist so "Complete this before continuing" appears after Step 1B and its required-next-step note, not between the phone vendor options and the Business 411 walkthrough.
- Removed the redundant Module 1 Section 1 "Lesson complete" block that linked to Business Address, since the page already has Next section navigation.
- Fixed lesson checklist checkmarks globally by removing the encoded text checkmark from `public/Scripts/vf-redesign.js` and drawing the mark in CSS instead. This prevents the checked boxes from showing garbled letters such as "ACE" on all lessons.

## Legal Setup And Banking Updates - May 13, 2026

- Secretary of State lesson no longer uses the same image as the LLC vs Corporation lesson.
- Added `public/Resources/images/secretary-of-state-records.svg` for official filing/state record visuals.
- Updated `/contact-list/` video poster and why-this-matters image to use the new Secretary of State records image.
- Rebuilt `contact-list-lesson.webm` so the in-video image also matches the Secretary of State topic.
- Business Bank Account lesson now emphasizes local/community or regional relationship banking:
  - Choose a bank where the member can build a relationship with a business banker.
  - Local/community banks may be more useful for early loan conversations than large national banks when the business is young or credit is not perfect.
  - Ask about business lines of credit, SBA lending, secured lending, and named business banker support before opening the account.
- Replaced static bank cards on `/bank-account/` with a state/city relationship-bank finder that points members to FDIC BankFind and targeted community bank/SBA lender searches instead of hard-coding a stale list of banks.
- Rebuilt `bank-account-recreated.webm` with updated narration and normalized volume.

## Business Plan Lesson Update - May 13, 2026

- `/business-plan/` now has a stronger resource section with multiple paths:
  - LivePlan for guided business plan software.
  - Bplans for sample plan examples.
  - SCORE for a free startup business plan template.
  - Verge Five sample PDF download for a restaurant/store style plan.
- Added original sample plan source at `public/Resources/files/sample-restaurant-business-plan.html`.
- Generated downloadable sample PDF at `public/Resources/files/sample-restaurant-business-plan.pdf`.
- The sample plan uses a fictional restaurant/cafe/store concept and includes:
  - Executive summary.
  - Company overview.
  - Customer profile.
  - Products and services.
  - Operations.
  - Marketing.
  - Management.
  - Startup costs.
  - 12-month projection.
  - Three-year projection.
  - Document checklist.
- Updated the lesson note and checklist so members review the sample PDF before building their own plan.

## Approval Readiness Bureau Update - May 13, 2026

- `/equifax-business/` resource section expanded from two basic cards to three bureau/monitoring resources:
  - Creditsafe.
  - Equifax Business.
  - NAV.com.
- Replaced old banner-style images in the resource cards with clean logo-style assets:
  - `public/Resources/images/creditsafe-logo.svg`.
  - `public/Resources/images/equifax-business-logo.svg`.
  - Existing NAV logo asset.
- Updated page copy to explain that members should check what is reporting, what is missing, and whether the business record is consistent before applying.
- Added `tools/source-transcripts/equifax-business.clean.txt`.
- Regenerated `public/Resources/audio/equifax-business-narration.wav` with `bf_emma`.
- Rebuilt `public/Resources/videos/equifax-business-lesson.webm` with NAV/monitoring narration and updated slides.

## 12-Point Criteria And NAV Pronunciation Fixes - May 13, 2026

- `/newpagea5b34995/` now includes a real 12-point readiness review instead of only a generic action checklist.
- The 12 points now cover:
  - Legal business name.
  - EIN.
  - Active state entity.
  - Valid business address.
  - Business phone number.
  - Business 411 listing.
  - Professional website.
  - Domain email.
  - Business bank account.
  - Bank rating and activity.
  - Licenses and records.
  - Bureau visibility.
- Added `tools/source-transcripts/newpagea5b34995.clean.txt`.
- Regenerated `public/Resources/audio/newpagea5b34995-narration.wav` and rebuilt `public/Resources/videos/newpagea5b34995-lesson.webm`.
- Fixed Module 7 NAV/eCredable video pronunciation by changing transcript and slides to say `N A V dot com` and `E Credable`.
- Regenerated `public/Resources/audio/nav-boot-source-narration.wav` and rebuilt `public/Resources/videos/nav-boot-recreated.webm`.

## Module 7 Section Order Update - May 13, 2026

- Module 7 now starts with `/revolving-business-credit-cards/` as Section 1.
- `/nav-boot/` is now Section 2 and comes after revolving business credit cards.
- Updated Module 6 next links to point to revolving business credit cards.
- Updated Module 8 previous links to point back to NAV.com and eCredable.
- Updated dashboard Module 7 card to open the revolving business credit cards section first.

## Module 1 Phone And Website Email Fixes - May 13, 2026

- `/phones-and-411/` now defensively removes any business profile intake block if it appears on that page. Business profile setup belongs on the dashboard/pre-module area only.
- Fixed Lesson 1A and Lesson 1B video header layout so the title and helper copy wrap instead of clipping.
- Increased left padding on the Business 411 required next step panel so the premium accent bar no longer covers the word `Required` or the heading text.
- `/newpage87229491/` now emphasizes domain-based business email as part of the website/domain lesson:
  - Missing business email is called out as a major red flag.
  - Examples include `firstname.lastname@yourdomain.com`, `info@yourdomain.com`, and similar domain addresses.
  - Mentions providers such as GoDaddy, Wix, Webflow, Google Workspace, and Microsoft 365 can help set up domain email.
- Updated `tools/source-transcripts/newpage87229491.clean.txt`.
- Regenerated `public/Resources/audio/newpage87229491-source-narration.wav` and rebuilt `public/Resources/videos/newpage87229491-recreated.webm`.

## Module 3 Banking Consolidation - May 13, 2026

- Removed the separate `Your bank rating worksheet` step from Module 3 navigation.
- `/bank-rating/` now combines the bank rating lesson with balance/account tracking fields.
- Module 3 now has two visible sections:
  - Business bank account.
  - Business bank rating and balance tracking.
- `/your-bank-rating/` is now a redirect to `/bank-rating/` so old links do not break.
- Business Plan previous-module navigation now points back to `/bank-rating/`.

## Module 5 Thumbnail Fix - May 13, 2026

- `/comparable-credit/` no longer uses the same thumbnail/intro image as `/equifax-business/`.
- Business Credit Bureaus keeps `business-credit-advisor.png`.
- Comparable Credit now uses generated image `public/Resources/images/comparable-credit-thumbnail.png` for the video poster and why-this-matters image.

## Business Plan Visual Update - May 13, 2026

- Added generated image `public/Resources/images/business-plan-meeting-thumbnail.png`.
- `/business-plan/` why-this-matters section now uses the new business planning meeting image instead of the old generic plan image.
- Business plan resource section now has richer premium color treatment:
  - Section background gradient.
  - Colored top accents on each card.
  - Dark blue, teal, green, and gold logo bands for LivePlan, Bplans, SCORE, and PDF.

## Deploy Command

From project root:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages deploy public --project-name vergefive --branch main
```

Cloudflare sometimes times out on first deploy attempt. Retrying has worked.

## QA Pattern Used

Browser QA is typically done with Playwright through bundled Node:

- Node: `C:\Users\calne\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`
- `NODE_PATH`: `C:\Users\calne\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules`
- Chrome: `C:\Program Files\Google\Chrome\Application\chrome.exe`

QA checks used:

- Verify lesson video exists.
- Verify video loads at 1280x720.
- Verify audio decodes during playback.
- Verify every lesson has video.
- Verify every lesson image loads and has valid dimensions.
- Verify pages return 200 on deployed URL.

## AI Business Visibility Audit Buildout - May 20, 2026
- Added an actual member buildout section to `public/ai-visibility-audit/index.html` under the before/after scan cards.
- The buildout now tells the member what to fix next and links into the correct Verge Five modules: legal/entity, phone, Business 411, business address, website/domain email, banking, and 12-point readiness.
- Updated `public/Scripts/vf-redesign.js` so saved before/after audit results render a prioritized "Next move" and ready/verify/build-first cards.
- Updated `functions/api/visibility-scan.js` and `functions/api/member/visibility-audits.js` to include and persist scan signal flags, so saved audits can rebuild the recommendation path.
- Fixed the AI audit page desktop layout by assigning the main audit content to the wide member column and the sidebar to the narrow column.
- Local QA used a mocked member API through the in-app browser at desktop and phone width. Checks passed: syntax, 7 buildout steps render, no mobile horizontal overflow, and desktop main/sidebar columns align correctly.

## Free Test Drive Access - May 21, 2026
- New account registration now creates a `trial` membership with a default 7-day `current_period_end` (`TRIAL_DAYS` env can override 1-30 days).
- `trial` status is active only until `current_period_end`; expired trials redirect to `/membership/?trial=expired`.
- Trial accounts can access the limited test-drive paths: Account, Start Here, Dashboard, AI Visibility Audit, and Module 1 phone/411 preview.
- Trial accounts can use limited member APIs for profile, progress, and visibility audit saves. Full member tools, later modules, reports, vendor library, cards, and funding paths redirect to upgrade.
- Membership and signup pages now promote the free 7-day test drive, and signup redirects to `/start-here/?trial=started` when email verification is not required.
- Logged-in trial users see a dark blue test-drive banner with the trial end date and an Upgrade CTA.

## Module 1 Phone Options Copy - May 21, 2026
- Updated the TurnCom360 phone option card to describe a complete business phone system with mobile app and professional calling presence before introducing the done-for-you setup.
- Reduced the TurnCom360 logo sizing cap on the phone options card so it visually matches RingCentral and Grasshopper better.

## Things To Continue Later

Recommended next work:

1. Review all lesson copy for polish and consistency.
2. Add member authentication/storage if not already handled externally.
3. Turn progress reports into saved member reports.
4. Build a full downloadable readiness report across all completed lessons.
5. Verify custom domain status for `vergefive.com` and `www.vergefive.com`.
6. Review mobile layouts lesson by lesson.
7. Continue improving videos with captions if desired.
8. Consider moving video hosting to R2 if Pages size/file limits become an issue again.

## Module 2 LLC vs Corporation Image Update - May 13, 2026
- Replaced the duplicated generic LLC vs Corporation image on Module 2 Lesson 1 with a new premium legal-office visual focused on entity-structure decision making.
- Saved the new asset at `public/Resources/images/llc-vs-corporation-thumbnail.png`.
- Updated the live lesson page poster, Why This Matters image, and `tools/lesson-video-data.json` poster reference for future video rebuild consistency.

## Module 1 Thumbnail Image Updates - May 13, 2026
- Added `public/Resources/images/website-domain-email-thumbnail.png` for Module 1 Section 3, showing website, domain, SSL, and professional domain email context.
- Added `public/Resources/images/business-address-commercial-thumbnail.png` for Module 1 Section 2, showing a real commercial office/reception environment instead of a generic workspace.
- Updated the Website and Domain Email page, Business Address page, and any matching `tools/lesson-video-data.json` poster references for future video rebuild consistency.

## Pre-Module Orientation / Start Here Page - May 13, 2026
- Added `public/start-here/index.html` as the pre-module orientation page members should visit before Module 1.
- The page explains the buildout process, captures basic business profile fields, and tells members to verify existing items inside the lessons instead of skipping modules.
- Removed the old dashboard-injected deep checkbox intake flow from the JavaScript behavior; the profile intake now hydrates explicit `[data-business-profile-intake]` forms only.
- Updated homepage and dashboard start CTAs to point to `/start-here/`.

## Homepage Promo Video - May 13, 2026
- Rebuilt the homepage promo/explainer video as a slower 53-second spot focused on burned business-credit buyers, Net 30 readiness matching, and credit card path matching.
- Regenerated the narration with male voice `am_michael` at slower speed `0.88`; script is intentionally shorter with fewer on-screen words to avoid overlap.
- Rendered browser-native WebM to `public/Resources/videos/verge-five-homepage-promo.webm` with real platform screenshots and a regenerated poster.
- Added a homepage promo video section directly after the hero with a CTA to `/start-here/`.
- Deployed preview `https://d3e30972.vergefive.pages.dev/` includes the promo section; live video playback was verified over HTTP with duration `95.307148`, `readyState: 4`, and no media error.
- Revised deployment `https://f0cdb25c.vergefive.pages.dev/` includes the slower male-voice version; live playback verified with duration `53.114609`, `readyState: 4`, and no media error.
- Approved-script deployment `https://598b52cc.vergefive.pages.dev/` uses the user's expanded Verge Five script, `am_michael` male narration at speed `0.9`, and revised seven-scene visuals; live playback verified with duration `91.320656`, `readyState: 4`, and no media error.
- Improved deployment `https://51ae9b39.vergefive.pages.dev/` adds a subtle procedural background music bed, replaces off-center/cropped screenshots with clean platform-style visuals, centers the final CTA scene, and keeps the video directly under the homepage hero. Live playback verified with duration `89.928664`, `readyState: 4`, and no media error.
- Music-level deployment `https://f45f9b2d.vergefive.pages.dev/` increases the background music bed to gain `0.22` so it is audible under the male voiceover. Live playback verified with duration `90.154273`, `readyState: 4`, and no media error.
- Promo spacing fix deployment `https://bf9c13f6.vergefive.pages.dev/` fixes the opening scene pill overlap by dynamically spacing “No guessing” and “No rushed applications.” Live playback verified with duration `90.168757`, `readyState: 4`, and no media error.
- HyperFrames source project lives at `tools/homepage-promo-video/`; MP4 rendering is pending FFmpeg availability.

## Homepage Section Rhythm Fix - May 21, 2026
- Scoped the homepage rhythm update to `public/index.html`; interior member pages and `public/Style/vf-redesign.css` were left untouched.
- Added homepage section tokens for cool blue-gray, white, and hairline borders.
- Updated the homepage rhythm to read navy hero, cool intro, white denial-signal section, cool scan, deep navy stats, lighter navy matcher, white testimonial, cool pricing, and footer.
- Added a bronze 2px hero bottom edge and converted the four silent-denial cards to cool blue-gray cards on the white section.
- Removed the inline desktop pricing-grid override so mobile no longer overflows horizontally.

## Public Visibility Scan Update - May 21, 2026
- Removed visitor-selected readiness checkboxes from the homepage visibility scan.
- The public scan now asks for business name, state, optional website, and optional phone only.
- The scan result now populates surface-signal chips from the lookup response instead of trusting user-checked boxes.
- API scoring no longer boosts from manually selected setup signals; it treats public visibility as a lightweight lead-in and keeps the stronger "right type of identifier" verification inside the paid platform.

## Public Trial Roadmap Redesign - May 21, 2026
- Redesigned `public/trial-roadmap/index.html` sample profile section while leaving the top hero and interior member pages untouched.
- Trimmed the visible public checklist to 6 core signals and kept hidden demo signals so the existing preset/scoring engine still supports the full 12-signal logic.
- Replaced the duplicate score card with a slim readiness summary at the top of the right column.
- Compact Net 30 and card path preview cards now use 140px desktop card art, four compact one-line sample cards, and tighter spacing.
- Moved report preview to a full-width card below the grid, removed the redundant numbered list, and kept the sample report modal.
- Restyled the Example callout to the blue/cool-gray homepage palette.
- Relabeled the trial page nav link from Public demo to Walkthrough.
- Added a "Signals present, risks remain" context block under the readiness summary that explains phone lookup/classification, incomplete website quality, Secretary of State mismatch, address validation, and other identifier-quality risks.

## Homepage Hero + Sample Check - May 21, 2026
- Rebuilt `public/index.html` around the clean `4f8a9061` hero: dashboard hero, advisor image, readiness dashboard, and the "Build business credit in the right order" positioning.
- Placed the public demo "Sample profile check" section directly below the hero.
- Removed the three visible left-column checklist items requested by the user: existing tradeline history, owner credit can support underwriting, and deposit available for secured products.
- Kept those three signals hidden for the demo preset/scoring engine so "Looks ready" still demonstrates the full readiness logic.
- Added `homepage-system-demo` body class and updated `vf-redesign.js` so the older homepage conversion script does not inject the previous scan/quick-demo hero over this static homepage.
- Corrected the follow-up placement so only the `4f8a9061` hero section is added in the third position after the sample profile check; removed the extra promo/platform/system sections from the homepage.

## Walkthrough Second-Section Hero - May 21, 2026
- Added the clean `4f8a9061` dashboard hero section to `public/demo/index.html` as the second main section.
- Walkthrough order is now: public test-drive intro, clean dashboard hero, sample profile check.
- Demo engine remains intact; the sample preset buttons still update vendor/card readiness.

## Homepage Reset to 4f8a9061 - May 21, 2026
- Replaced `public/index.html` with the full homepage source from `https://4f8a9061.vergefive.pages.dev/`.
- Removed the `homepage-system-demo` bypass so `vf-redesign.js` builds the intended homepage shown in the reference screenshot: scan hero, walkthrough video under the hero actions, quick platform test drive, AI visibility card, identifier-quality caveat section, system sections, and $49/$497 membership pricing.
- Deployed corrected preview `https://d445ea3a.vergefive.pages.dev/`.
- Live QA confirmed the homepage returns 200, shows "Start or fix your business profile before you apply.", includes the public visibility scan, hero video, quick demo, AI audit, system section, $49/$497 pricing, and has no desktop or mobile horizontal overflow.

## Homepage Quick Demo Signal Row - May 21, 2026
- Added a horizontal professional signal row under the homepage quick demo preset buttons.
- Signal row includes E-I-N, Business phone, 411 listing, Commercial address, Website, Domain email, Bank account, and 90+ days.
- "Starting out" now checks only E-I-N and Business phone; "Some items ready" checks the middle profile signals; "Looks ready" checks the full visible row.
- The signal boxes are clickable and update the same demo score/matcher engine as the preset buttons.
- Deployed preview `https://ffcef205.vergefive.pages.dev/`; desktop and mobile QA confirmed no horizontal overflow.
- Follow-up fix deployed to `https://a6047db2.vergefive.pages.dev/`: card status labels now read clearly as `Ready`, `Almost ready`, or `Do not apply yet`. Live QA confirmed "Looks ready" changes all vendor and card previews to `Ready`.

## Combined Homepage Hero - May 21, 2026
- Rebuilt the main homepage hero to combine the public test-drive message with the advisor/readiness dashboard visual stack from the reference screenshot.
- Hero now uses the dark navy gradient, "Business credit done right" pill, "See how Verge Five checks readiness before you apply." headline, sample-check/access CTAs, trust points, and two explainer cards: "Preview the decision system" and "The right identifiers matter."
- Replaced the hero scan form/video treatment with the right-side advisor image and readiness dashboard stack.
- Kept the quick platform test drive directly below the hero and verified its "Looks ready" preset still changes vendor/card preview counts to 4 ready.
- Deployed preview `https://cba964f9.vergefive.pages.dev/`; desktop and mobile QA confirmed no hero scan/video remains in the hero, no console errors, and no horizontal overflow.

## Test Drive Scan Hero - May 21, 2026
- Rebuilt `/demo/` to use the former scan-and-video homepage layout as the test drive page hero.
- Top of `/demo/` now shows "Start or fix your business profile before you apply." on the left, walkthrough video under the hero actions, and the free business visibility scan on the right.
- Removed the extra `walkthrough-second-hero` dashboard section so the page flows directly from the scan/video hero into the interactive sample profile check.
- Excluded public pages such as `/demo/`, `/trial-roadmap/`, `/blog/`, `/membership/`, `/login/`, and `/signup/` from member-progress save calls to prevent public-page 401s.
- Deployed preview `https://09eb7c04.vergefive.pages.dev/demo/`; desktop and mobile QA confirmed scan, video, sample demo behavior, no old second hero, no console errors, no failed responses, and no horizontal overflow.

## Homepage Scan Video Section - May 21, 2026
- Added the scan-and-video section from the reference screenshot directly underneath the main homepage hero.
- Homepage order is now: combined dashboard hero, scan/video section, quick platform test drive, AI visibility card, caveat section, then the remaining homepage content.
- The inserted section includes "Start or fix your business profile before you apply.", walkthrough video, free business visibility scan, and the three trust points.
- Deployed preview `https://a711c0e5.vergefive.pages.dev/`; desktop and mobile QA confirmed the section appears in the correct second position, scan/video render, quick demo moved down one, no console errors, no failed responses, no horizontal overflow, and the "Looks ready" preset still sets vendors/cards to 4 ready.
- Removed the lower standalone promo-video band with heading "Watch how Verge Five guides the buildout before applications."; deployed preview `https://a63818af.vergefive.pages.dev/`.
- Added a shared `Visibility scan` menu item to the desktop nav and mobile panel. It links to `/#home-visibility-scan`; deployed preview `https://f42bee2a.vergefive.pages.dev/`.

## Homepage Version 1 Snapshot - May 21, 2026
- Preserved the current homepage before the next redesign pass.
- Snapshot stored at `docs/homepage-versions/v1-2026-05-21/`.
- Files saved: `index.html`, `vf-redesign.css`, `vf-redesign.js`, and a `README.md` manifest.
- Version 1 reference deployment: `https://f42bee2a.vergefive.pages.dev/`.

## Homepage Version 2 Single Landing Page - May 21, 2026
- Reworked the homepage into the Version 2 single long-scroll structure while preserving the working scan form, video source, and existing `data-demo-drive` demo engine.
- New order: hero, How it works, Why it fails, Free scan + Walkthrough, public scan breakdown, stats band, Inside the platform, member story, pricing, footer.
- Replaced the top nav with five anchor links: How it works, Why it fails, Free scan, Inside the platform, and Pricing.
- Preserved the public visibility scan form internals and prefilled it with Riverside Coffee LLC / NC / riversidecoffee.co; scan result still renders inside the existing `[data-scan-result]` panel.
- Moved the existing quick demo into the `#inside-the-platform` section without changing `initDemoDrive()` or the hidden 12-signal scoring inputs.
- Added the 4-column footer and light/dark section rhythm requested in the Version 2 prompt.
- Deployed preview: `https://fef1d238.vergefive.pages.dev/`.
- QA: `node --check public/Scripts/vf-redesign.js` passed; deployed homepage has all required anchors, no console errors, scan submit returns a score, the "Looks ready" demo preset updates to 100 with 4 ready vendors and 4 ready cards, `/trial-roadmap/` returns 200, and `/phones-and-411/` redirects to login.

## Homepage Polish Static Pass - May 22, 2026
- Applied the strict static homepage polish request to `public/index.html` and `public/Style/vf-redesign.css` only.
- Removed the homepage script include from `public/index.html` so the previous JS-injected scan/demo homepage does not override this static page; `public/Scripts/vf-redesign.js` was not edited.
- Kept the exact section order from `public/index.html`: hero, promo video, platform preview, trust band, five-step system, media split, why-it-matters, pricing, final CTA, footer.
- Added in-page nav links: How it works, Why it matters, Pricing, Blog.
- Updated hero to navy gradient with bronze underline on "right order."; kept hero images and dashboard preview references unchanged.
- Updated the promo heading bronze accent, section rhythm, trust/final bands, footer palette, and the Why it matters cards: Phone, Address, Records, Timing.
- Updated static pricing copy to $49/month and $497/year with the annual recommended badge.
- Deployed preview: `https://5bfac92b.vergefive.pages.dev/`.
- QA: `node --check public/Scripts/vf-redesign.js` passed, deployed homepage has no scan form, no demo root, no homepage script injection, no console errors, correct nav labels, correct pricing, correct signal cards, video source unchanged, and images render.

## Homepage Restructure - May 13, 2026
- Moved the free business visibility scan into the right side of the homepage hero.
- Updated hero positioning to lead with identifier quality: the issue is not merely having a phone/address/website/email, but whether they are the right commercial type and consistent enough to classify the company as a real business.
- Removed the separate public scan section injection so the first interaction is now inside the hero.
- Revised homepage flow: hero with scan, identifier-quality caveat section, promo video, platform/matcher preview, system, audit/prompt support, pricing.
- Deployed preview `https://d5384a50.vergefive.pages.dev/`; live JS QA confirmed the hero scan exists, no separate scan section exists, the promo follows the caveat section, and the live scan form returned a public lookup result.
- Conversion scan update deployed to `https://58d7e631.vergefive.pages.dev/`: changed public scan scoring from `1-5` to `1-10`, updated hero headline to “Your business may be visible. But does it look fundable?”, added result copy clarifying visibility is not full readiness, and added locked platform readiness areas for business identity quality, vendor readiness, and credit card readiness. Live QA confirmed `/10` result and lock cards render.
