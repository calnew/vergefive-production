# Verge Five UX, Content Clarity, and Instructional Flow Audit

Date: 2026-05-22  
Scope reviewed: 81 HTML pages under `public/`, including public marketing pages, signup/login/membership, dashboard, onboarding, member lessons, vendor/category pages, blog posts, report pages, and legacy redirect pages.

## Executive Summary

Verge Five has the right instructional foundation: it teaches users to build business credit in sequence instead of jumping into applications. The strongest pieces are the 8-module member dashboard, the module sidebars, the readiness checklists, the public demo/test-drive concept, and the vendor/card readiness logic.

The main UX problem is not missing content. The main problem is too much repeated content and inconsistent naming. A first-time user can understand the big idea, but they may get confused by:

- pricing mismatch between homepage and membership checkout,
- 5-step marketing language versus 8-module platform language,
- repeated generic lesson copy that does not explain the current lesson clearly,
- unclear difference between "demo," "test drive," "free scan," and "7-day test drive,"
- CTA labels that change names for similar actions,
- vendor/category pages that repeat the same warning and CTA without enough context,
- report/download language that appears in multiple places without a single "reports live here" mental model.

Overall, the system is close, but it needs a content simplification pass and a navigation/CTA vocabulary pass before it will feel smooth to beginners.

## Remediation Status - 2026-05-22

The first remediation pass is now implemented in the local project. Completed items include the broken final-summary encoding fix, legacy redirect mappings, header CTA cleanup, lesson-specific copy replacements, proof/checklist helper copy, browser/account progress language, completion summaries, beginner definitions, Start Here bullets, address examples, domain-email explanation, bank-document checklist, stronger 12-point readiness language, vendor reporting language, provider-specific external CTAs, and vendor-card `See requirements` CTAs.

QA status: a deterministic local crawl scanned 82 HTML files with 0 missing internal href or asset targets. Module order, legacy redirect mappings, checklist proof/gated-completion markup, final summary print/download copy, and Cloudflare mobile behavior are verified. A live authenticated active-member crawl on the Cloudflare preview branch checked 27 protected member routes at 390px width with 0px horizontal overflow and no login misroutes.

## Scores

| Area | Score | Reason |
|---|---:|---|
| Overall UX | 7.1 / 10 | Structure is strong, but repeated templates and inconsistent CTAs create friction. |
| Content clarity | 6.8 / 10 | Most lessons explain the right ideas, but generic copy weakens beginner comprehension. |
| Onboarding | 6.5 / 10 | Start Here is useful, but demo, scan, trial, membership, and roadmap paths need clearer separation. |
| Educational flow | 7.6 / 10 | Module order mostly matches the real-world business credit process. Needs smoother transitions and fewer duplicated explanations. |

## High-Priority Findings

### 1. Pricing mismatch between homepage and membership

Severity: Critical  
Pages: `/index.html`, `/membership/`

Original wording:

- Homepage: `Monthly $29`
- Homepage: `Annual $299`
- Membership: `Monthly $49/month`
- Membership: `$497/year`

Why this confuses users:

A visitor may see one price on the homepage and a different price on the membership page. This creates distrust right before payment.

Recommended rewrite:

- Homepage monthly: `Monthly access - $49/mo`
- Homepage annual: `Annual access - $497/yr`
- If the price may change, use: `Choose monthly or annual access on the membership page.`

Recommendation:

Update the homepage pricing to match membership, or remove prices from the homepage and send users to `/membership/`.

### 2. 5-step marketing language conflicts with 8-module platform language

Severity: Critical  
Pages: `/index.html`, `/homeefe757a6/`, `/start-here/`, most lessons

Original wording:

- `5-step guided system`
- `Five steps, one correct order.`
- `Your 8-module business credit buildout.`
- `8-module buildout`

Why this confuses users:

Users may wonder whether they are buying a 5-step system or an 8-module course. The content actually supports both ideas, but the relationship is not explained.

Recommended rewrite:

Use one master explanation:

> Verge Five is an 8-module buildout organized around 5 phases: identity, legal setup, banking, approval readiness, and credit access.

Recommended heading:

> 8 modules. 5 phases. One correct order.

Recommendation:

Keep "5 phases" for marketing simplicity, but label the member area as "8 modules inside the 5-phase roadmap."

### 3. Generic lesson explanation repeats across many pages

Severity: Moderate  
Pages: `/bank-account/`, `/comparable-credit/`, `/business-credit-criteria/`, multiple lessons

Original wording:

> Business credit approvals are built from signals. This lesson helps the member create one of those signals correctly, document it, and avoid moving ahead with information that does not match.

Why this confuses users:

This is true, but it is too generic. It appears on lessons where the user needs specific guidance. Beginners need to know exactly what this page is about.

Recommended rewrites by lesson type:

- Bank account:
  > This account becomes proof that the business is operating. Open it under the exact legal business name, keep activity clean, and save statements before applying for credit.

- Comparable credit:
  > Lenders often compare the size of new credit requests to what your business has already handled. Start small, let accounts report, then move to larger approvals.

- 12-point criteria:
  > This is the final readiness checkpoint before vendor applications. If anything here is missing or mismatched, fix it before applying.

Recommendation:

Replace the generic paragraph with lesson-specific "why this matters" copy on every lesson.

### 4. Test drive, demo, free scan, and free trial overlap

Severity: Critical  
Pages: `/demo/`, `/trial-roadmap/`, `/membership/`, `/signup/`, `/index.html`

Original wording:

- `Test drive the platform`
- `Start free 7-day test drive`
- `Free business visibility scan`
- `Check a sample profile`
- `Unlock the full platform`

Why this confuses users:

There are at least three "free" experiences:

- public visibility scan,
- public sample demo,
- account-based 7-day trial/test drive.

Users may not know which one they are starting, what they get, or whether they need an account.

Recommended rewrite:

Define three clear paths:

- `Free visibility scan` = no account, quick public score.
- `Sample demo` = no account, fake business profile preview.
- `7-day test drive` = account required, limited member access.

Recommended CTA set:

- `Run free visibility scan`
- `Try the sample demo`
- `Start 7-day test drive`
- `Unlock full access`

Recommendation:

Use these exact labels consistently across homepage, demo, membership, and signup.

### 5. CTA labels are inconsistent across the platform

Severity: Moderate  
Pages: all public and member pages

Original wording examples:

- `Get access`
- `Unlock full access`
- `Unlock the full platform`
- `Start the checklist`
- `Start the roadmap`
- `Preview the platform`
- `Continue`
- `Dashboard`
- `Next module`
- `Next section`

Why this confuses users:

The same action is sometimes named differently. For a beginner, changing labels makes the system feel less guided.

Recommended CTA vocabulary:

| Situation | Use this label |
|---|---|
| Public visitor starts scan | `Run free visibility scan` |
| Public visitor opens sample demo | `Try sample demo` |
| Visitor starts account trial | `Start 7-day test drive` |
| Visitor pays | `Unlock full access` |
| Member continues lesson | `Continue to next section` |
| Member goes to dashboard | `Back to dashboard` |
| Vendor/card item is not ready | `See readiness requirements` |
| External vendor resource | `Open [Provider Name]` |

Recommendation:

Create a CTA label standard and update all pages to follow it.

### 6. Checklist button labels include helper copy inside the clickable label

Severity: Moderate  
Pages: most member lessons

Original wording:

> Open the account in the legal business name Mark complete when finished.

Why this confuses users:

The extraction shows the button reads as one long phrase. Screen readers and some users may hear it as a sentence instead of a task with helper text.

Recommended rewrite:

Task:

> Open the account in the legal business name

Helper:

> Check this after the account is open and proof is saved.

Recommendation:

Keep each checklist button to one clear action. Move repeated helper text into small muted text or remove it when obvious.

### 7. "Lesson complete" and "Before you leave" are redundant

Severity: Moderate  
Pages: most member lessons

Original wording:

> Lesson complete  
> You have completed this requirement. Continue to the next member lesson when your proof is saved.

Original wording:

> Before you leave  
> Finish the checklist items on this page. The platform sequence depends on completing each foundation item in order.

Why this confuses users:

These sections repeat across lessons and do not always tell the user the exact next action.

Recommended rewrite:

Locked state:

> Finish these tasks before moving on.  
> Once all items are checked, the next section will open.

Completed state:

> You are ready for the next section: [Next Section Name].  
> Keep your proof saved before continuing.

Recommendation:

Make the locked/completed state dynamic and tied to the actual next page.

### 8. Vendor/category CTAs repeat "Check readiness" too often

Severity: Moderate  
Pages: `/starter-net-30-vendors/`, `/building-and-industrial/`, `/office-and-cleaning/`, `/general-credit-cards/`, vendor category pages

Original wording:

> Check readiness

Why this confuses users:

Every card says the same thing. Users do not know whether clicking opens the vendor, checks their profile, explains requirements, or sends them backward.

Recommended rewrite:

If locked:

> See requirements

If nearly ready:

> Review before applying

If ready:

> Open vendor details

Recommendation:

Use state-based CTA labels in the vendor/card matchers.

### 9. "Visit website" is too generic for external resources

Severity: Minor  
Pages: `/phones-and-411/`, `/business-address/`, `/website-domain-email/`, `/business-plan/`, `/llc-vs-corporation/`, `/equifax-business/`, `/nav-boot/`

Original wording:

> Visit website

Why this confuses users:

Users should know where the link goes before clicking.

Recommended rewrite:

- `Open TurnCom360`
- `Open RingCentral`
- `Open Regus`
- `Open LivePlan`
- `Open Bizee`
- `Open NAV.com`

Recommendation:

Use provider-specific external link labels.

### 10. Homepage does not fully match the current product structure

Severity: Critical  
Page: `/index.html`

Original wording:

> Build business credit in the right order

Original wording:

> Start the checklist

Original wording:

> Monthly $29 / Annual $299

Why this confuses users:

The homepage is still a clean marketing page, but it does not clearly explain the public visibility scan, the sample demo, the 7-day test drive, or the 8-module paid experience. It also has outdated pricing.

Recommended rewrite:

Hero:

> Start or fix your business profile before you apply.

Subhead:

> Verge Five shows whether your business identifiers, records, banking, and application timing are ready before you waste vendor or credit card applications.

CTA row:

> Run free visibility scan  
> Try sample demo  
> Start 7-day test drive

Recommendation:

Make the homepage explain the three entry paths clearly, then send users into the right one.

## Page-by-Page Audit Summary

### Public Marketing Pages

| Page | Current role | Main issue | Severity | Recommendation |
|---|---|---|---|---|
| `/index.html` | Primary homepage | Pricing mismatch, 5-step vs 8-module mismatch, no clear distinction between scan/demo/trial | Critical | Update pricing, explain 5 phases inside 8 modules, add clear entry-path CTAs. |
| `/home/` | Legacy/simple home | Duplicate home experience | Moderate | Redirect to `/` or remove from navigation/search. |
| `/demo/` | Public scan + sample demo | Strong concept, but mixes scan, video, demo, and score in one dense page | Moderate | Label it "Public sample demo" and distinguish it from 7-day test drive. |
| `/trial-roadmap/` | Post-preview upgrade page | Good locked-module concept, but overlaps with `/demo/` | Moderate | Use only after Module 1 preview; rename to "What unlocks next." |
| `/blog/` | Blog index | CTA is generic and repeated | Minor | Make CTA topic-specific: "Use the full buildout checklist." |
| `/contact/` | Contact page | Clear enough | Minor | Add "For billing/account help, log in first" to reduce support confusion. |
| `/affiliate-signup/` | Affiliate application | Good purpose but not connected to footer flow strongly | Minor | Add short commission rule summary before form. |

### Account, Signup, Membership, and Access Pages

| Page | Current role | Main issue | Severity | Recommendation |
|---|---|---|---|---|
| `/membership/` | Plan selection | Best current access page; language is clearer than homepage | Minor | Keep this as pricing source of truth. |
| `/signup/` | Trial account creation | Good, but "test drive" needs to match demo language | Moderate | Say "Create an account for the 7-day member test drive." |
| `/login/` | Member login | Clear | Minor | Add helper: "Use the email you used at checkout or trial signup." |
| `/verify-email/` | Email verification | Clear | Minor | Add "Check spam/promotions" if not already handled by error state. |
| `/account/` | Account actions | Clear but thin | Minor | Show membership status and next billing date when available. |
| `/admin/` | Owner admin | Functional, but not part of member UX | Minor | Ensure admin is never exposed in public nav. |
| `/contact-usb3806186/` | Legacy page | Old page still exists behind redirect | Minor | Keep redirect only; remove stale page in cleanup. |

### Onboarding and Dashboard

| Page | Current role | Main issue | Severity | Recommendation |
|---|---|---|---|---|
| `/start-here/` | Pre-module orientation | Strong but dense; NAP, vendor options, profile, and roadmap compete | Moderate | Add a 3-step intro: "1. Save profile. 2. Understand NAP. 3. Start Module 1." |
| `/homeefe757a6/` | Member dashboard | Strong module layout | Minor | Add "Resume where you left off" that points to saved last lesson, not generic dashboard. |
| `/business-visibility-audit/` | Before/after scan | Concept is right, but users may expect it to perform a complete business visibility audit | Moderate | Rename to "Public Visibility Scan" inside member area and state what it checks/does not check. |
| `/conversational-ai-bot/` | AI assistant | Thin page | Moderate | Add examples: "Ask: Which step should I do next?" |
| `/downloads/` | Downloads | Potentially unclear after reports moved | Moderate | Rename to "Templates and worksheets" or merge into report area. |

### Module 1: Business Identity

| Page | Current role | Main issue | Severity | Recommendation |
|---|---|---|---|---|
| `/phones-and-411/` | Phone and 411 | Good sequencing: phone first, 411 next | Minor | Rename "Visit website" buttons to provider names; ensure 1B clearly says "after phone is active." |
| `/business-address/` | Commercial address | Good caveat on mailbox-only address | Minor | Add one-sentence summary at top: "Your address must look like a real place a business can operate from." |
| `/website-domain-email/` | Website/email | Strong content, but too much provider text | Moderate | Collapse provider details and emphasize "domain email is required." |

### Module 2: Legal Setup

| Page | Current role | Main issue | Severity | Recommendation |
|---|---|---|---|---|
| `/llc-vs-corporation/` | Entity choice | Good caveat section | Minor | Add "Most users should confirm this with a tax/legal professional." |
| `/contact-list/` | Secretary of State | Page title sounds like support contact list | Moderate | Rename to "Secretary of State filing offices." |
| `/ein/` | EIN | Good, but wording "EIN from IRS" may be stiff | Minor | Use "Get or verify your EIN." |

### Module 3: Banking Foundation

| Page | Current role | Main issue | Severity | Recommendation |
|---|---|---|---|---|
| `/bank-account/` | Open account | Strong local-bank guidance | Minor | Simplify external search buttons to "Find local banks" and "Find SBA lenders." |
| `/bank-rating/` | Bank rating | "Low 5 rating" needs clearer explanation | Moderate | Explain: "A Low 5 usually means an average balance around $10,000." |
| `/your-bank-rating/` | Redirect | Fine as legacy redirect | Minor | Keep redirect, remove from sitemap/navigation if present. |

### Module 4: Business Plan and Report

| Page | Current role | Main issue | Severity | Recommendation |
|---|---|---|---|---|
| `/business-plan/` | Business plan | Repeats "credible story" twice | Minor | Combine into one why-it-matters section. |
| `/business-plan-report/` | Progress report | Good separation from lessons | Minor | Add "This report does not include proprietary lesson content." near download buttons. |
| `/final-readiness-summary/` | Final summary | Good concept | Moderate | Tie it more clearly to "what you may qualify for next." |

### Module 5: Approval Readiness

| Page | Current role | Main issue | Severity | Recommendation |
|---|---|---|---|---|
| `/equifax-business/` | Bureaus | Good resources, but title undersells CreditSafe/NAV context | Moderate | Rename to "Business credit bureaus and monitoring." |
| `/comparable-credit/` | Comparable credit | Needs plain-English definition earlier | Moderate | Add: "Comparable credit means lenders look at what your business has already handled." |
| `/business-credit-criteria/` | 12-point review | Strong checkpoint | Minor | Make it the required gate before vendor/card directories. |

### Module 6: Starter Vendor Credit

| Page | Current role | Main issue | Severity | Recommendation |
|---|---|---|---|---|
| `/about-net-30/` | Net 30 education | Good but should transition directly into matcher | Moderate | End with "Now open the vendor matcher and only apply where the profile is ready." |
| `/starter-net-30-vendors/` | Vendor directory | Repeated "Check readiness" CTAs | Moderate | Use state-based CTAs and compact details modal copy. |
| Vendor category pages | Category education | All use similar warning and "How to use this category" copy | Moderate | Keep template but add category-specific caveat and CTA. |

### Module 7: Credit Tools / Cards

| Page | Current role | Main issue | Severity | Recommendation |
|---|---|---|---|---|
| `/revolving-business-credit-cards/` | Card path | Good order after readiness | Minor | Use "credit cards and secured cards" in heading to match user expectation. |
| `/nav-boot/` | NAV.com and eCredable | File/page name says `nav-boot`, which looks like a typo | Moderate | Rename route to `/nav-ecredable/` or `/nav-ecredable-fast-track/`. |
| `/general-credit-cards/` | Card category | Same vendor-category CTA issue | Moderate | State whether each card path is secured, fleet, bank, or corporate. |
| `/starter-cards/` | Starter cards | Same category issue | Moderate | Add "Use only after Module 5 readiness review." |

### Module 8: Funding

| Page | Current role | Main issue | Severity | Recommendation |
|---|---|---|---|---|
| `/cd-business-loans/` | CD-secured loans | Good lower-risk explanation | Minor | Add a clear warning: "Only use money you can afford to hold as collateral." |

### Blog Pages

All 25 article pages follow a consistent structure, which is good for production. The issue is that the bottom CTA and sections are too repetitive.

Repeated original wording:

> Quick readiness check

Repeated original wording:

> Turn this guidance into a step-by-step business credit buildout.

Why this may weaken conversion:

The CTA becomes invisible because every article ends the same way.

Recommended rewrite pattern:

- For address article:
  > Ready to check whether your address could pass lender review?

- For phone article:
  > Before you use a mobile number on another application, check the business phone setup module.

- For Net 30 article:
  > See which starter vendors fit your current business profile.

Recommendation:

Keep the blog template, but make each CTA connect to the article topic.

### Legacy Pages

| Page | Status | Issue | Recommendation |
|---|---|---|---|
| `/newpage7c157847/` | Legacy copy of LLC page | Should not be visible as canonical experience | Keep redirect only. |
| `/newpage87229491/` | Legacy copy of website/email page | Should not be visible as canonical experience | Keep redirect only. |
| `/newpagea5b34995/` | Legacy copy of criteria page | Should not be visible as canonical experience | Keep redirect only. |
| `/newpagebd8ae2e6/` | Legacy copy of high-tech page | Should not be visible as canonical experience | Keep redirect only. |
| `/newpageed554e37/` | Legacy copy of assets page | Should not be visible as canonical experience | Keep redirect only. |

## Redundancy Report

| Redundant pattern | Count observed | Severity | Recommendation |
|---|---:|---|---|
| `Check readiness` on vendor/card category buttons | 48 | Moderate | Replace with state-based CTA labels. |
| `Visit website` on provider resource cards | 27 | Minor | Replace with provider-specific labels. |
| `Quick readiness check` on blog articles | 25 | Minor | Keep heading but vary CTA by topic. |
| `Turn this guidance into a step-by-step business credit buildout.` | 25 | Moderate | Make blog CTA topic-specific. |
| `8-module buildout` sidebar repeated | 21 | Minor | Keep, but add current module context only once per page. |
| `Complete this before continuing` | 19 | Minor | Keep as consistent checklist heading. |
| `Lesson complete` / `Before you leave` | 12 each | Moderate | Make dynamic and specific to next section. |
| Generic "Business credit approvals are built from signals..." | Multiple lessons | Moderate | Replace with lesson-specific explanations. |

## Clarity Improvement Report

### Critical terminology to define once and reuse

- NAP: Name, address, phone. Define as "the public business identity lenders compare across records."
- Business 411: Define as "a commercial directory listing that helps verify the business phone number."
- Bank rating: Define with a balance example.
- Comparable credit: Define as "credit similar to what the business has already handled."
- Net 30: Define as "buy now, pay invoice within 30 days."
- Readiness: Define as "the business profile is clean enough to apply without wasting applications."

### Suggested beginner-friendly glossary block

Add a collapsible "Terms used in this lesson" block on lessons where jargon appears. Keep it short.

Example:

> NAP means name, address, and phone. Lenders compare these details across public records, banking, websites, and applications. If they do not match, the business can look risky.

## UX Friction Report

| Friction point | Severity | Why it matters | Remedy |
|---|---|---|---|
| Homepage price mismatch | Critical | Breaks checkout trust | Update or remove homepage prices. |
| Demo vs trial language | Critical | Users do not know what is free or account-based | Define scan, sample demo, and 7-day test drive. |
| 5-step vs 8-module mismatch | Critical | Confuses product structure | Explain 8 modules inside 5 phases. |
| Generic lesson copy | Moderate | Reduces confidence in instruction | Write lesson-specific why-it-matters copy. |
| Dense Start Here page | Moderate | First-time users may not know what to do first | Add 3-step "Start here" summary. |
| Repeated vendor CTAs | Moderate | Users do not know what clicking does | Use state-based CTAs. |
| Legacy pages still exist | Minor | Can create duplicate maintenance burden | Keep redirects, remove old physical pages later. |

## Recommended Restructuring Plan

### Phase 1: Fix Trust Breakers

1. Fix homepage pricing to match membership.
2. Standardize product language: "8 modules inside 5 phases."
3. Standardize free-entry paths: scan, sample demo, 7-day test drive.

### Phase 2: Simplify Lesson Templates

1. Replace generic why-it-matters paragraphs.
2. Replace repetitive locked/completed copy.
3. Clean checklist task labels.
4. Rename provider CTAs.

### Phase 3: Improve Beginner Guidance

1. Add lesson-specific "You are here / What this does / What happens next."
2. Add glossary blocks for NAP, Net 30, Business 411, bank rating, comparable credit.
3. Add short transition copy at the bottom of each module.

### Phase 4: Improve Vendor/Card Experience

1. State-based CTAs: Ready, Build first, Do not apply yet.
2. Explain why each vendor/card is locked.
3. Keep card modals compact and avoid covering text.

### Phase 5: Blog Conversion Polish

1. Make article CTAs topic-specific.
2. Add article-to-module links.
3. Reduce repeated bottom sections.

## High-Priority Fix List

1. Fix homepage pricing mismatch.
2. Explain 5-phase versus 8-module structure.
3. Standardize "free scan," "sample demo," and "7-day test drive."
4. Replace generic why-it-matters copy in member lessons.
5. Clean checklist labels and helper text.
6. Rename `nav-boot` route to a clean NAV/eCredable URL.
7. Replace repeated vendor button text with state-based labels.
8. Add a clear first-time-user "Start Here in 3 steps" summary.
9. Make report/download language consistent and centralized.
10. Remove physical legacy duplicate pages after redirects are confirmed stable.

## Low-Priority Polish Improvements

1. Replace repetitive blog CTA language with article-specific CTAs.
2. Add collapsible glossary blocks.
3. Add topic-specific supporting images where repeated imagery remains.
4. Add provider-specific button labels.
5. Add "last updated" or "requirements can change" note on vendor/card pages.
6. Add short "proof to save" callout to each lesson.
7. Add a smoother handoff from final summary to support/coaching.
8. Add small tooltips for "Ready," "Build first," and "Locked."
9. Improve alt text on any remaining generated/placeholder image labels.
10. Add consistent "Back to dashboard" placement at page bottoms.

## Top 10 Recommendations to Improve Conversion, Trust, and Completion

1. Align all pricing immediately.
2. Rename the product model to "8 modules inside 5 phases."
3. Make the homepage entry paths impossible to confuse: scan, sample demo, trial, paid access.
4. Replace generic lesson explanations with specific plain-English guidance.
5. Add "what you just did / why it matters / what happens next" to each lesson.
6. Use one CTA vocabulary across the platform.
7. Make the test drive show locked value without making users feel trapped.
8. Make vendor/card CTAs state-aware instead of repeating "Check readiness."
9. Add glossary explanations for business credit terms at the point of use.
10. Make the progress report the emotional payoff: "Here is what you have built, what is still missing, and what you may qualify for next."

## Final Closeout Status - 2026-05-23

The remaining high-priority UX audit items have been closed in the Cloudflare project source: homepage pricing now matches membership, homepage product language explains the 8-module/5-phase model, public video/demo content moved to `/whats-inside/`, `/demo/` redirects to the What’s Inside page, and the awkward `/nav-boot/` member route has a clean canonical replacement at `/nav-ecredable/` with backwards-compatible redirects.

Remaining blockers are external configuration items already tracked in `VERIFICATION.md`: production domain routing, preview Stripe/Turnstile/email secrets, and the admin allowlist alignment for live admin rendering. The public and protected mobile layout audit is complete on the Cloudflare preview target.