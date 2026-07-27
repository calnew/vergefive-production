# Verge Five canonical backend decision

The migration keeps one backend: Cloudflare Workers with D1. The deleted Prisma,
Postgres, NextAuth, and Vercel prototype was a parallel implementation and is not
part of the release path.

## Canonical runtime

- Next.js App Router deployed through OpenNext to Cloudflare Workers.
- Cloudflare D1 for member identity, sessions, progress, audits, support,
  affiliate, email, and billing records.
- The reviewed base SQL in `schema/member-progress.sql` and ordered files in
  `schema/migrations/` are applied in CI before a dev Worker deployment.
  `schema_migrations` records each applied version, and CI verifies the expected
  shape. Request handlers must not create or alter tables.
- Development uses `vergefive-members-dev`; production keeps
  `vergefive-members`. A dev deployment must fail if it resolves the production
  D1 identifier.
- `/api/billing/*` remains the canonical Stripe path.
- `/api/stripe/*` remains disabled/no-mutation unless a later migration proves
  parity and Bill explicitly approves the change.
- Access and billing remain separate so imported or manually entitled members
  do not lose access because their Stripe state differs.

## First vertical-slice records

| Product state | D1 source of truth |
|---|---|
| Phone & 411 selected option | `readiness_signals` using `selected_option:phones` |
| Fix status | `member_fix_status`, one atomic row per member and fix |
| Proof checklist | `lesson_progress.completed_indexes` |
| Scan evidence | `visibility_audits.result_json`, immutable after capture |
| Contextual help | `support_requests` |

Legacy `fix_progress` and `fix_done` readiness signals remain readable during
the migration, but all new status writes use `member_fix_status`.

## Deferred decisions

- R2 and upload separation for slices that need member files.
- Any replacement of the canonical billing endpoints.
- Any production data migration or destructive schema change.
- Provider partnerships, endorsement language, and Done-With-You commercial
  terms.

These require their own reviewed slice and production approval. They are not
implicit in the Phone & 411 release.
