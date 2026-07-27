# Build-tool advisory disposition

Date: 2026-07-26

## Current evidence

- `npm audit --omit=dev --audit-level=high` reports zero production dependency
  vulnerabilities.
- The vulnerable `sharp` runtime dependency was replaced with `0.35.2`.
- The remaining full-audit findings are transitive development/build
  dependencies in ESLint and the current OpenNext Cloudflare toolchain.
- The latest compatible OpenNext Cloudflare release is used by this branch.

## Disposition

These remaining advisories do not block a dev-only pull request because the
packages are used by the reviewed CI build and are not shipped as application
runtime dependencies. They do block treating the dependency audit as clean and
must remain visible in the release packet.

Do not force an ESLint major upgrade, downgrade OpenNext, or use
`npm audit fix --force` in this migration slice. Re-evaluate the advisories when
upstream compatible releases are available and before any production promotion.

Production remains blocked by the separate explicit-approval gate regardless of
this disposition.
