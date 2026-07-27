# Verge Five deployment workflow

GitHub is the source of truth. Deployments are never run from a developer laptop.

## Environments

| Target | GitHub branch/environment | Cloudflare compute | D1 |
| --- | --- | --- | --- |
| Development | `scan-first-platform-redesign` / `vergefive-dev` | `vergefive-next-dev` Worker | `vergefive-members-dev` |
| Production | protected `main` / `vergefive-production` | Existing Verge Five production | `vergefive-members` |

The migration branch has no production deployment workflow. Production remains on the existing release until Bill explicitly approves an exact release-candidate SHA and target.

## Development delivery

1. Create a feature branch from the latest `scan-first-platform-redesign`.
2. Run the repository checks and build locally.
3. Push the feature branch and open a pull request into `scan-first-platform-redesign`.
4. Wait for the pull-request verification job to pass.
5. Merge the reviewed pull request.
6. GitHub Actions:
   - resolves or creates `vergefive-members-dev`;
   - rejects the production D1 ID;
   - applies `schema/member-progress.sql` to dev only;
   - builds the OpenNext Worker;
   - deploys `vergefive-next-dev`.
7. Verify the dev URL, Console, Network, authenticated journeys, and mobile/desktop screenshots.

Required GitHub Environment secrets for `vergefive-dev`:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Required secrets on the dev Worker must be test/dev values only. This includes authentication, admin allowlist, email, visibility-scan providers, and Stripe test-mode configuration.

## Prohibited operations

- Do not run local Wrangler deploy, upload, D1 mutation, R2 mutation, secret-write, or route-change commands.
- Do not bind dev to `vergefive-members`.
- Do not copy production members, Stripe live keys, or private customer assets into dev.
- Do not add production deployment automation until the release packet, rollback evidence, and approval gate are complete.

## Production promotion

Production promotion is blocked until all release gates pass. The approval request must name:

- the exact immutable commit SHA;
- the `vergefive-production` target;
- the approved pull request;
- green checks on that SHA;
- migration and rollback procedure;
- production smoke tests and monitoring plan.

Bill's earlier approval to develop never authorizes production.

## Rollback

- Development: redeploy the previously verified dev SHA through GitHub Actions.
- Database: D1 changes in this milestone are additive; do not drop tables or delete the dev database during rollback.
- Production: the pre-migration Git baseline is tagged `pre-migration-main-2026-07-26`. Cloudflare deployment metadata and a current production data recovery point are still required before the tag can be treated as a complete production rollback packet.

See `docs/MIGRATION_RELEASE_GUARDRAILS.md` for the current environment contract and unresolved release gates.
