# UX Content Remediation Plan

This checklist tracks the fixes from the full UX, content clarity, and instructional-flow audit.

## Status Key

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete

## Stage 1 - Foundation Cleanup

- [x] Fix broken encoding on `public/final-readiness-summary/index.html`.
  - Current issue: `Ã¢Å“â€œ` appears in the final path list.
  - Replacement: use a normal ASCII label such as `Done` or a clean checkmark only if encoding is guaranteed.
  - Severity: Critical
  - Status note: replaced the broken checkmark with the HTML entity `&#10003;` so it renders cleanly without depending on file encoding.

- [x] Clean duplicate legacy URLs.
  - Current issue: old generated slugs still exist, including `newpage87229491`, `newpage7c157847`, `newpagea5b34995`, `newpagebd8ae2e6`, and `newpageed554e37`.
  - Recommendation: redirect legacy slugs to clean equivalents:
    - `/newpage87229491/` -> `/website-domain-email/`
    - `/newpage7c157847/` -> `/llc-vs-corporation/`
    - `/newpagea5b34995/` -> `/business-credit-criteria/`
    - `/newpagebd8ae2e6/` -> `/high-tech-auto-vendors/`
    - `/newpageed554e37/` -> `/business-assets-equipment/`
  - Severity: Critical
  - Status note: redirects now exist in both Cloudflare middleware and `public/_redirects`. Legacy static folders still remain on disk for safety, but traffic is routed to clean URLs.

- [x] Standardize primary header CTA.
  - Current: `Continue`
  - Recommended: `Continue Buildout`
  - Severity: Minor
  - Status note: public member headers and mobile panels now use `Continue Buildout`.

- [x] Standardize module CTAs.
  - Current: `Open module`, `Open lesson`, `Continue`
  - Recommended:
    - `Start Module` when not started
    - `Continue Module` when in progress
    - `Start Lesson` or `Continue Lesson` on lesson cards
  - Severity: Moderate
  - Status note: dashboard module-card labels now use `Start Module`; generic external `Visit website` links were replaced with provider-specific labels; vendor-card readiness links now use `See requirements`.

## Stage 2 - Lesson Template Improvements

- [x] Replace repeated generic lesson body.
  - Current repeated wording: `Business credit approvals are built from signals. This lesson helps the member create one of those signals correctly, document it, and avoid moving ahead with information that does not match.`
  - Recommendation: create lesson-specific plain-English intros.
  - Severity: Moderate
  - Status note: replaced the repeated generic paragraph across the active lesson pages and matching legacy duplicates with page-specific plain-English guidance.

- [x] Add proof examples to every lesson checklist area.
  - Recommended copy: `Proof can be a screenshot, confirmation email, PDF, bank letter, invoice, or saved record that shows the step is complete.`
  - Severity: Moderate
  - Status note: added a reusable proof note above lesson checklists and changed generic checklist helper text to `Check this after you have saved proof.`

- [x] Add a `What you completed / Why it matters / What happens next` summary block to lesson completion states.
  - Severity: Moderate
  - Status note: shared checklist JavaScript now enhances every `data-gated` lesson completion panel with a three-part completion summary and preserves the existing next-step CTA.

- [x] Clarify progress storage.
  - Current issue: local/browser-based progress can look like account-saved progress.
  - Recommended copy: `Progress is saved to this browser unless you are logged in and account sync is active.`
  - Severity: Moderate
  - Status note: lesson proof notes now explain that checked items are saved in the browser and synced to the member account when logged in.

## Stage 3 - Glossary And Beginner Clarity

- [x] Add plain-English definitions/tooltips for key terms:
  - NAP
  - EIN
  - DUNS
  - tradeline
  - Net 30
  - bank rating
  - Low 5
  - comparable credit
  - business bureaus
  - personal guarantee
  - PAYDEX
  - Creditsafe
  - NAV.com
  - eCredable
  - Severity: Moderate
  - Status note: added or strengthened inline definitions for Business 411, NAP context, EIN timing, DUNS/D&B, tradelines, Net 30, bank rating, Low 5, comparable credit, business bureaus, personal guarantee, PAYDEX context, Creditsafe, NAV.com, and eCredable. A broader tooltip layer can still be added later, but the beginner-facing definitions from this pass are now covered inline.

- [x] Add immediate definition for `Low 5`.
  - Current: `A Low 5 rating or better can support stronger business credit applications.`
  - Recommended: `A Low 5 bank rating usually means the business keeps a stronger average balance, often around the low five-figure range, which can make applications look stronger.`
  - Severity: Moderate

- [x] Add immediate definition for `comparable credit`.
  - Current: `Comparable credit is an approval bridge.`
  - Recommended: `Comparable credit means lenders compare your new request to credit your business has already handled responsibly.`
  - Severity: Moderate
  - Status note: the Comparable Credit lesson now opens with a plain-English explanation of comparable credit instead of generic signal copy.

- [x] Add immediate definition for `Net 30`.
  - Recommended: `Net 30 means the business buys now and pays the invoice in about 30 days.`
  - Severity: Minor

## Stage 4 - Page-Specific Fixes

- [x] Start Here: shorten long orientation paragraphs into scannable bullets.
  - Severity: Minor
  - Status note: the opening orientation now uses concise verification bullets before the module path.

- [x] Dashboard: add a current-step card.
  - Recommended copy: `You are currently on Module X. Finish this step before moving forward.`
  - Severity: Moderate

- [x] Phone/411: define Business 411 before asking the user to list the number.
  - Severity: Minor

- [x] Business Address: add acceptable vs risky address examples.
  - Severity: Moderate
  - Status note: added explicit acceptable/risky address examples above the address verification checklist.

- [x] Website + Domain Email: define domain email with an example.
  - Recommended copy: `A domain email uses your website name, like info@yourcompany.com, instead of Gmail or Yahoo.`
  - Severity: Moderate
  - Status note: added the domain email definition and example inside the website approval standard.

- [x] EIN: add warning not to apply until the legal name is final.
  - Severity: Moderate

- [x] Bank Account: add a `bring these documents` checklist.
  - Severity: Minor
  - Status note: added a bank-visit document checklist covering formation records, EIN letter, ownership authorization, ID, address proof, and opening deposit.

- [x] Bank Rating: add examples for balance ranges and explain Low 5.
  - Severity: Moderate

- [x] Business Bureaus: add mini glossary for D&B, Experian Business, Equifax Business, and Creditsafe.
  - Severity: Moderate

- [x] 12-Point Criteria: strengthen the checkpoint language.
  - Recommended copy: `If any item is missing, stop here and fix it before applying for vendors.`
  - Severity: Moderate
  - Status note: strengthened the 12-point review copy to stop applications if any item is missing.

- [x] Vendor pages: clarify `Reports: Business bureaus vary`.
  - Recommended copy: `Reporting can change. Confirm directly with the vendor before applying.`
  - Severity: Moderate
  - Status note: vendor cards now use `Reports: Verify with vendor`.

- [x] Credit Cards: add personal guarantee warning.
  - Recommended copy: `Many business credit cards may still check the owner's personal credit or require a personal guarantee.`
  - Severity: Moderate

- [x] CD-Secured Loans: add simple definition.
  - Recommended copy: `You place money in a CD, and the bank lends against it to lower the bank's risk.`
  - Severity: Minor

- [x] Account/Login/Membership: clarify trial vs paid access.
  - Recommended additions:
    - `What you can access now`
    - `What unlocks after upgrade`
  - Severity: Moderate
  - Status note: membership page now clearly separates the free 7-day test drive from full paid platform access and explains what the test drive includes.

- [x] Downloads/Support/AI Assistant: replace generic copy with examples.
  - Example: `Ask: Am I ready for Net 30 vendors?`
  - Severity: Minor
  - Status note: downloads, AI assistant, and support pages now give specific examples and next actions instead of generic workflow copy.

## Stage 5 - QA Pass

- [x] Verify all public navigation links.
  - Status note: local static href check scanned 82 HTML files and found 0 missing internal href targets.
- [x] Verify member-module navigation order.
  - Status note: static dashboard check confirms the 8 module cards appear in the intended sequence.
- [x] Verify redirects from legacy URLs.
  - Status note: legacy mappings are present in both `public/_redirects` and `functions/_middleware.js`.
- [x] Verify checklist behavior after wording updates.
  - Status note: static checklist check found 19 checklist pages, each with a gated completion panel, proof note, and saved-proof helper text.
- [x] Verify mobile layout after new glossary/proof blocks.
  - Status note: checked the protected member pages on Cloudflare preview branch backend-progress with an authenticated active QA member at 390px mobile width. Verified .member-layout loads for Phone/411, Business Address, Approval Criteria, and Net 30 pages; captured Cloudflare preview screenshots; cleaned up the temporary qa-mobile-* remote D1 user.
  - Status note: later live Cloudflare mobile verification superseded the earlier local tooling gap: 27 protected member routes were checked at 390px width with 0px horizontal overflow and no login misroutes.
- [x] Verify final summary/report print/download copy.
  - Status note: final summary exposes print/download controls, likely qualification copy, member-safe export copy, and no broken encoding.
- [x] Re-run headless page crawl.
  - Status note: Cloudflare preview branch `backend-progress` was crawled after the authenticated mobile pass: 83 deployed routes returned HTTP 200 and 128 internal href/src references returned no bad responses.
- [x] Update `docs/ux-content-flow-audit-2026-05-22.md` with completed status notes.

## Recommended Implementation Order

1. Encoding and redirects
2. Shared header/CTA language
3. Shared lesson template/proof language
4. Glossary definitions
5. Page-specific copy blocks
6. QA crawl and screenshots

## Notes

Do not mix this work into the FlexDesk 360 workspace. This plan belongs to the Verge Five business-credit platform.

## Final audit closeout - 2026-05-23

- [x] Public demo/test-drive language split finalized.
  - Status note: the public `/demo/` route now redirects to `/whats-inside/`, and the homepage points visitors to the free visibility scan plus the What�s Inside preview instead of crowding video/demo content on the front page.
- [x] Homepage product model and pricing aligned.
  - Status note: source homepage copy now uses `8 modules. 5 phases. One correct order.` and the static pricing matches membership at `$49` monthly and `$497` annual.
- [x] Clean NAV/eCredable route added.
  - Status note: `/nav-ecredable/` is now the canonical member route, while `/nav-boot/` remains as a backwards-compatible redirect.
- [x] Full active-member mobile crawl on Cloudflare preview. Status note: 27 protected member routes were checked at 390px width with an active QA member; every route had 0px horizontal overflow and the temporary QA user was deleted afterward.

## Environment audit recheck - 2026-05-24

- [x] Recheck Cloudflare preview versus production-domain routing. Status note: backend-progress returns HTTP 200 from Cloudflare, but www.vergefive.com still returns HTTP 200 from nginx/Duda. Preview /api/config still reports Stripe, Turnstile, and email readiness flags as false, so the remaining work is external Cloudflare/DNS/secret configuration rather than source-code UX cleanup.
## Business Visibility Audit update - 2026-05-24

- [x] Rename member-facing visibility audit language and strengthen before/after flow. Status note: /business-visibility-audit/ is now the clean member route, /ai-visibility-audit/ redirects to it, and the page presents a before scan at the top, buildout guidance in the middle, and an after scan checkpoint near the bottom.

