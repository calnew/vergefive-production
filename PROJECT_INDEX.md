# Verge Five Business Credit Platform

## Purpose

This project contains the Verge Five business-credit education platform. The platform teaches business owners how to build business credit in the correct order: business identity, legal setup, banking foundation, business plan, approval readiness, starter vendors, credit tools, and bank funding options.

## Primary Audience

- New business owners with little or no business-credit experience
- Entrepreneurs trying to separate business credit from personal credit
- Members who need a guided, step-by-step curriculum instead of a list of random applications
- Coaches/admins who need to review member readiness, progress, and reports

## Current Project Location

Codex project folder:

`C:\Users\calne\Documents\Codex\VergeFive-Business-Credit-Platform`

Original working copy copied from:

`D:\Cowork\veregefive\vergefive_cloudflare`

## Important Folders

- `public/` - generated public site pages, member pages, assets, static routes, redirects, headers
- `functions/` - Cloudflare Pages Functions for auth, billing, member profile/progress, reports, visibility scans, admin endpoints
- `functions/_lib/` - shared auth, security, Stripe, and affiliate helpers
- `schema/` - database schema, including member progress tables
- `tools/` - generation, video, QA, blog, and rebuild scripts
- `docs/` - audits, page maps, duplicate wording reports, and planning documents
- `qa/` - screenshots and browser/headless audit evidence

## Key Existing Documents

- `docs/ux-content-flow-audit-2026-05-22.md` - detailed UX/content/instructional-flow audit
- `docs/ux-audit-page-map.json` - page map for audit coverage
- `docs/ux-audit-duplicate-phrases.json` - repeated phrase report
- `BACKEND_PROGRESS_PLAN.md` - backend progress notes
- `DEPLOY.md` - deployment notes
- `REVAMP_MEMORY.md` - historical development memory/context
- `VERIFICATION.md` - verification notes
- `VISIBILITY_SCAN_SETUP.md` - visibility scan setup notes

## Core Experience

1. Public visitor lands on the marketing/demo experience.
2. User starts a trial or membership.
3. User begins at `Start Here`.
4. User enters basic business profile information.
5. User follows the 8-module buildout in order.
6. User watches lesson videos, completes checklists, saves proof, and advances.
7. User checks readiness before vendor, card, and funding applications.
8. User uses reports and support/AI tools to understand what to fix next.

## 8-Module Curriculum

1. Business Identity
2. Legal Setup
3. Banking Foundation
4. Business Plan
5. Approval Readiness
6. Starter Vendor Credit
7. Credit Tools
8. Bank Funding Options

## Current UX/Content Remediation Focus

The current improvement pass is based on a full UX, content clarity, and instructional-flow audit. Main fixes:

- Remove repeated generic lesson language
- Define beginner business-credit terms before use
- Clarify proof requirements
- Add current-step and next-step guidance
- Clean duplicate legacy URLs
- Fix final report encoding issue
- Improve CTA consistency
- Make account/trial/full access states clearer

See `UX_CONTENT_REMEDIATION_PLAN.md` for the active checklist.

## Working Rule

Future work for the business-credit platform should happen from this project folder, not from the FlexDesk 360 revamp workspace. FlexDesk is the coworking platform; Verge Five is the business-credit education platform.
