# Verge Five Project Import Manifest

Imported on: 2026-05-22

## Primary project

Source:

`C:\Users\calne\Documents\Codex\VergeFive-Business-Credit-Platform`

Destination:

`C:\Users\calne\OneDrive\Documents\Verge five`

This is the active Verge Five business credit platform/revamp workspace. It includes:

- `public/` static site pages, resources, scripts, styles, video/audio assets, and sitemap files.
- `functions/` Cloudflare Pages Functions APIs and shared backend libraries.
- `schema/` database schema work.
- `tools/` content, narration, video, homepage promo, and QA tooling.
- `qa/` browser audit outputs, screenshots, reports, and validation scripts.
- `docs/` UX audit material, homepage version snapshots, and project documentation.
- Root handoff and planning files including `REVAMP_MEMORY.md`, `PROJECT_INDEX.md`, `UX_CONTENT_REMEDIATION_PLAN.md`, `DEPLOY.md`, and `BACKEND_PROGRESS_PLAN.md`.

## Reference imports

### MemberReel stabilization sandbox

Source:

`C:\Users\calne\Documents\Codex\MemberReel-Stabilization-Sandbox`

Destination:

`_reference\MemberReel-Stabilization-Sandbox`

This was imported because related MemberReel material was mentioned as part of the Verge Five revamp context. It is kept under `_reference` so it can be reviewed without mixing its app structure into the Verge Five deployable root.

### Go Verge5 / video material

Source:

`C:\Users\calne\Documents\Codex\2026-05-10\files-mentioned-by-the-user-go`

Destination:

`_reference\go-verge5-video`

This includes the Go Verge5 remix folder, source video/audio, transcript files, and nearby video-production artifacts from the same Codex work area.

### Codex root VergeFive artifacts

Source:

`C:\Users\calne\Documents\Codex`

Destination:

`_reference\codex-root-artifacts`

This includes the standalone `VERGEFIVE_UX_CONTENT_FLOW_AUDIT.md` plus related comparison, nav, and report screenshots/PDFs that were stored at the Codex root.

## Intentional exclusions

The import excluded transient or nested project-control material that should not become part of the new project repository:

- `.git`
- `.wrangler`
- `node_modules`
- `.pydeps`
- Chromium/browser profile cache folders
- `*.log`

These exclusions keep the project portable while preserving the actual app code, content, documentation, QA outputs, and media assets.
