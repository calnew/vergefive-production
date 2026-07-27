# Verge Five migration release guardrails

## Protected production baseline

- GitHub repository: `calnew/vergefive-production`
- Production branch: `main`
- Pre-migration Git tag: `pre-migration-main-2026-07-26`
- Tagged commit: `d7fcb44226831418a55f3789adb7ea6ddff78deb`
- `main` requires a pull request, enforces administrators, requires resolved conversations and linear history, and blocks force pushes and deletion.
- The `vergefive-production` environment requires reviewer `calnew`, accepts
  protected branches only, and disables administrator bypass.
- The tag records the GitHub production-branch baseline. Cloudflare deployment-to-commit traceability remains an open release gate until Cloudflare credentials are restored and the active deployment metadata is captured.

## Environment contract

| Resource | Development | Production |
| --- | --- | --- |
| Compute | `vergefive-next-dev` Worker | Existing `vergefive` Pages application |
| D1 | `vergefive-members-dev` | `vergefive-members` |
| D1 provisioning | GitHub Actions only | No migration workflow exists |
| Stripe | Test-mode keys only | Existing production secrets |
| Admin allowlist | Dev Worker secret only | Existing production secret |
| R2 | Not bound in slice 1 | Existing production assets remain untouched |
| URL | `vergefive-next-dev.turncomvoice.workers.dev` | Existing Verge Five public domains |

The committed dev Worker config intentionally contains an invalid D1 placeholder. GitHub Actions resolves or creates `vergefive-members-dev`, rejects the production D1 ID, applies the additive D1 schema and every required versioned migration, verifies the resulting 27-column schema shape, and only then builds and deploys the dev Worker.

The base schema and `schema/migrations/*.sql` are the only D1 schema owners.
Applied migrations are recorded in `schema_migrations`. Runtime request handlers
must not create or alter tables.

## Release boundaries

- Do not run local Wrangler deploy or upload commands.
- Do not run D1 writes against `vergefive-members`.
- Do not copy production member data, Stripe secrets, or private assets into dev.
- The first vertical slice stores only dev QA data in the isolated dev D1.
- Member endpoints require both an authenticated session and an active
  entitlement. Public scan writes are same-origin, size-bounded, rate-limited,
  and cleaned up on a seven-day guest-data schedule.
- Stripe webhook and checkout completion events use retryable processing records;
  only environment-matched Verge Five self-serve subscription events whose
  actual line-item price matches a configured plan can grant access.
- Test-coupon creation and debug authentication links are restricted to an
  explicitly configured development environment.
- Production promotion requires Bill's explicit approval for the exact release-candidate SHA and target environment.
- R2 uploads are outside slice 1. A separate dev bucket is required before uploads enter scope.

## Rollback

- Before the first dev deployment is verified, revert to `d04a6fe` as the known
  code-only rollback candidate. After deployment, record the exact verified dev
  SHA and workflow run here before accepting the slice.
- Dev D1 changes are additive. Do not delete the dev database as part of application rollback.
- A code rollback does not remove applied migrations. The application must remain
  backward-compatible with additive columns and tables.
- Production code and production D1 are not modified by this milestone.
