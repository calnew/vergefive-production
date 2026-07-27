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

The committed dev Worker config intentionally contains an invalid D1 placeholder. GitHub Actions resolves or creates `vergefive-members-dev`, rejects the production D1 ID, applies the additive D1 schema, and only then builds and deploys the dev Worker.

The schema file is the only D1 schema owner. Runtime request handlers must not
create or alter tables.

## Release boundaries

- Do not run local Wrangler deploy or upload commands.
- Do not run D1 writes against `vergefive-members`.
- Do not copy production member data, Stripe secrets, or private assets into dev.
- The first vertical slice stores only dev QA data in the isolated dev D1.
- Production promotion requires Bill's explicit approval for the exact release-candidate SHA and target environment.
- R2 uploads are outside slice 1. A separate dev bucket is required before uploads enter scope.

## Rollback

- Revert the migration commit or redeploy the previously verified dev SHA through GitHub Actions.
- Dev D1 changes are additive. Do not delete the dev database as part of application rollback.
- Production code and production D1 are not modified by this milestone.
