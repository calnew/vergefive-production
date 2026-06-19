# Verge Five Scan-First Dev Rollout Audit

Date: 2026-06-18

## Active dev environment

- Local dev checkout: `C:\Users\calne\Documents\VergeFive-Dev\vergefive-production`
- Branch: `scan-first-platform-redesign`
- Cloudflare Pages project: `vergefive`
- Build output: `public/`
- Production must remain untouched until Bill explicitly approves promotion.

## Source specs checked

- Prototype ZIP: `C:\Users\calne\Downloads\Fintech SaaS prototype delivery new.zip`
- Prototype top-level `CODEX_README.md`
- Repo spec: `docs/CLAUDE_VERGE_FIVE_PLATFORM_REDESIGN_README.md`
- Repo changelog: `docs/CLAUDE_VERGE_FIVE_PLATFORM_REDESIGN_CHANGELOG.md`

## Rollout decision

Use the repo-corrected model: 5 phases / 7 modules. Do not ship the older simplified prototype wording that says 5 modules only. Do not add Module 8 or separate "Bank Funding Options" as an eighth module.

## Coverage confirmed

- Required standalone pages exist: dashboard, scan, fix list, fix sections, account match pages, full buildout, support, account, report, trial, membership, signup, and login.
- Required local training videos exist under `public/Resources/videos/`.
- Account data sources exist and are authoritative:
  - `public/Scripts/vf-vendor-library.js`
  - `public/Scripts/vf-card-library.js`
  - `public/Scripts/vf-funding-library.js`
- Scan engine is real: `/api/visibility-scan`.
- Member scan history is real: `/api/member/visibility-audits`.
- Auth, profile, progress, billing, admin, contact, and feedback APIs exist under `functions/api/`.
- Scan-first state model exists in `public/Scripts/vf-redesign.js`: `fixStatus`, `selectedOptions`, `proofSaved`, `visited`, readiness, page progress, fix rendering, and account rendering.

## Gap fixed in this pass

- Support request flow was browser-only (`localStorage`). It now submits to `/api/contact` with the logged-in member identity when available, includes fix area, source route, selected setup option, priority, and details, and keeps a local fallback copy if the backend send fails.

## Remaining verification gates before production

- Run local Cloudflare Pages dev against this checkout.
- Browser QA: dashboard, scan, at least three fix pages, account matcher pages, support submit, full buildout, and mobile layout.
- Console and Network QA on dashboard, scan, support, account matcher, and one video lesson page.
- Confirm checkout/pricing copy and Stripe plan mapping before promoting any membership/pricing changes.
- Confirm live apply URLs from the three account libraries are used anywhere account detail CTAs are shown.
- Commit and push the dev branch only after local/dev verification passes.
- Production promotion requires Bill's explicit OK.
