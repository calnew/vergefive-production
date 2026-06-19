# Verge Five Implementation Phase Checklist

## Source Of Truth

- Dev repo: `C:\Users\calne\Documents\VergeFive-Dev\vergefive-production`
- Active branch: `scan-first-platform-redesign`
- GitHub is the source of truth.
- Cloudflare dev/preview is the validation environment.
- Production does not change until a phase is complete and approved.

## Non-Negotiables

- Preserve all working admin functionality from the live environment.
- Preserve all working auth, member access, scan, checkout, and backend routes unless a phase explicitly replaces them.
- Do not ship prototype HTML files as production code.
- Rebuild the new layouts in the real stack and wire them to the existing live systems.
- Keep the new platform path aligned to 5 phases.
- Replace stale prototype content with real data and real libraries before production promotion.
- Treat `Verge Five Platform.dc.html` as the current member-shell visual source of truth in dev.
- Do not block desktop/tablet implementation on pending mobile-only redesign work.

## Working Rule

Each phase must pass this gate before moving forward:

1. Implement in dev branch.
2. Verify the exact affected pages in dev/preview.
3. Confirm no admin or core-member regressions.
4. Commit the phase work cleanly.
5. Do not promote to production until approved.

## Phase 1: Foundation Shell

Goal: land the new UI shell without breaking the live backend behavior.

- Replace the public homepage shell with the approved direction.
- Replace the member app shell with the new sidebar, header, and page structure.
- Keep existing APIs, auth, admin tools, and member state untouched underneath.
- Keep routing stable while swapping presentation.

Exit criteria:

- Homepage shell renders in dev.
- Member shell renders in dev.
- Existing auth and admin still load.
- No production changes.

## Phase 2: Homepage Integration

Goal: finish the public-facing homepage implementation.

- Use the approved homepage as the visual source.
- Wire real nav, CTA targets, links, logos, hosted assets, and media.
- Remove stale prototype sections and conflicting old homepage copy.
- Keep the homepage connected to the real signup, membership, and information paths.

Exit criteria:

- Public homepage matches the approved structure in dev.
- CTA paths are real.
- Old conflicting homepage content is removed.
- Desktop and mobile both render acceptably in dev.

## Phase 3: Member Platform Shell

Goal: move the logged-in platform into the new layout while preserving current behavior.

- Port dashboard, fix pages, account views, buildout pages, and support pages into the new shell.
- Keep the current member data and business logic intact.
- Keep admin access and route protections intact.

Exit criteria:

- Logged-in member routes render in the new shell.
- Existing member state still loads.
- Admin access still works.

## Phase 4: Feature Wiring

Goal: connect the new UI to the real live systems.

- Wire scan engine results into the new dashboard and fix flows.
- Wire login/signup/logout and access states.
- Wire checkout and membership gates.
- Wire member progress, saved state, reports, and account matching.
- Wire support submission to the real backend path.

Exit criteria:

- Scan flow works end to end in dev.
- Auth flow works end to end in dev.
- Checkout flow works end to end in dev.
- Progress persists correctly.

## Phase 5: Admin Preservation Audit

Goal: confirm the redesign did not damage the original live admin capability.

- Audit member lookup and member detail tools.
- Audit progress reset/edit tools.
- Audit support/admin workflows.
- Audit any export, legacy, email, affiliate, and reporting functions still in use.

Exit criteria:

- All required admin functions are accounted for.
- Any broken admin function is fixed before production promotion.

## Phase 6: Real Content And Data Migration

Goal: replace prototype placeholders with real production-ready content.

- Replace placeholder videos with hosted production video URLs.
- Replace placeholder thumbnails and logos with real assets.
- Replace representative account data with the authoritative vendor, card, and funding libraries.
- Replace stubbed support and handoff behavior with real backend/CRM submission paths.

Exit criteria:

- No prototype placeholder media remains on target pages.
- Real account libraries are wired.
- Real support submission path is in place.

## Phase 7: Dev QA

Goal: prove the build is stable before any production move.

- QA public pages.
- QA member pages.
- QA admin pages.
- QA mobile and desktop.
- QA scan, signup, login, checkout, progress save, and support.
- QA route integrity, stale copy, and broken links.

Exit criteria:

- Dev/preview passes the targeted QA list.
- Remaining issues are documented and resolved or explicitly deferred.

## Phase 8: Production Promotion

Goal: promote safely in controlled slices.

- Promote homepage first.
- Promote member shell second.
- Promote feature wiring and data integrations after that.
- Re-verify after each promotion step.

Exit criteria:

- Production matches the approved release slice.
- Rollback point is known.
- GitHub and production are aligned to a commit.

## Immediate Next Build Order

1. Lock the homepage structure in dev.
2. Lock the member shell structure in dev.
3. Preserve admin and backend behavior while the new layout wraps it.
4. Then wire live features page by page.

## Current Focus

Current execution target:

- Phase 1 and Phase 2 together.
- Homepage shell and member shell first.
- No production promotion yet.

## Mobile Decision

- The current implementation source for the logged-in shell is `Verge Five Platform.dc.html`.
- Mobile-specific refinements can still be adjusted later, but they should not delay member-shell implementation, route wiring, admin preservation, or backend-safe layout migration.
- Any interim mobile changes should stay minimal and non-blocking unless they are required for core usability.
