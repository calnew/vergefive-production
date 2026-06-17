# CHANGELOG — Verge Five Platform (backend-aware revision)

This version turns the prototype from a visual redesign into a working model of the platform's logic. Recreate this behavior in your codebase; the HTML is the reference.

> **Functionality is preserved — this is a look/layout/hierarchy/flow redesign only.** Routes, auth pages, scan, fix routing, checklist completion, proof/progress saving, vendor/account unlock logic, support flow, and 7 modules / 5 phases all stay intact. The new UI connects to the existing behavior; nothing backend was removed.

## 0. Latest revision — two independent metrics + uniform action-first pages + real providers
- **Page Progress and Business Readiness are now separate, divergent metrics.**
  - *Business Readiness* = resolved scan signals only: `score = round(doneFixes / 9 * 100)` → labels Needs Work / Fair / Good / Ready for Account Match Review. Labeled "Scan signals".
  - *Page Progress* = platform engagement: pages visited + fixes touched + options chosen + proof saved (`60%` weight pages, `40%` actions). Labeled "Platform activity". Tracked via new `visited{}` state set on every `go()` / `openFix()` / `runScan()`. A member can have high Page Progress and low Readiness (clicked through without fixing) — the cards now say so explicitly ("Activity ≠ readiness").
- **All 9 fix pages now use the full action-first template uniformly** (previously only Phone/Address/Website): scan-finding banner (`issue` + `scanSource` + `impactLevel`) at top, action panel, selectable service options, proof/checklist, what-unlocks, compact video lower.
- **Real provider options per fix page:** Phone & 411 → TurnCom360 / RingCentral / Grasshopper; Entity → ZenBusiness / Northwest Registered Agent; EIN → IRS Direct; Bank → Mercury / Bluevine / Chase; Bank Rating → Verge Five balance plans; Criteria → D&B (D-U-N-S); Net 30 → starter list + sequencing. Each option carries `status` (recommended/available/review), `bestFor`, and `price`.


## 1. Scan-driven account availability (core change)
Account status is now **derived from completed fixes**, not hard-coded. Each account declares `requires: [fixKey,...]` and `pref` (preferred/recommended).
- Status logic (`acctStatus()` in the logic class):
  - 0 missing required fixes → `recommended` (if `pref`) or `available`
  - exactly 1 missing → `review`
  - 2+ missing → `notready` (credit cards) or `locked` (vendors)
- Full status set with labels: **Available Now** (`#E7F4EC`/`#15803D`), **Recommended Match** (`#EEF3FE`/`#2563EB`), **Review First** (`#FCF1E2`/`#B45309`), **Not Ready Yet** (`#F2ECEC`/`#9a6b6b`), **Locked Until Fixes** (`#EEF1F6`/`#5B6B82`).
- Each account computes an **unlock reason** string (e.g. "Complete Business Address + Business Bank Account to unlock.") and a per-requirement checklist (`reqMeta`: `{label, done, iconColor}`).
- Marking a fix complete (or selecting a service option / saving proof) re-derives every account status live, plus the readiness score, profile %, Next 3 Actions, and Full Buildout module statuses.

## 2. Fix page is now backend-aware
- **Top action panel** adds: a **Scan finding** banner (`fix.issue` + `fix.scanSource`), an **impact** badge (`fix.impactLevel`), and the live status badge. New buttons: **Do It Myself** (sets fix → In Progress, scrolls to checklist) and **Choose Setup Option** (scrolls to options). Get Help + Back to Dashboard retained; redundant Run Scan removed (still in header).
- **Recommended Setup Options** is now a **selectable service-option component**. Each option: `name, desc, bestFor, status (available|recommended|review), price, proofReq`, with **Select Option / Get Help** CTAs. Selecting sets `selectedOptions[fixKey]`, marks the fix In Progress, highlights the card, and shows a confirmation banner.
- **Proof to save** now has a working save state: "+ Upload & save proof" → "Proof saved ✓" (`proofSaved[fixKey]`), which also moves the fix to In Progress.
- New fix fields added to `phones`, `address`, `website`: `issue`, `scanSource`, `impactLevel`, and 4 real `options` each (incl. Done-For-You/Concierge). Other fixes fall back to sensible defaults in `renderVals()`.

## 3. Account Matches page rebuilt
- Added a **segmented tab control**: **All Matches / Vendor & Net 30 / Credit Cards** (`accountsTab` state; filters by `type`).
- Cards rebuilt to the readiness model: header band colored by type (gray when locked, with lock icon), category chip, status badge, why, **Required fixes checklist** (green/gray checks), **unlock-reason banner**, timing, and CTA by status (**Apply Now / View Details / Apply When Ready** + Help).
- Account catalog expanded across all categories: Starter Net 30 (Uline, Quill), Office & Cleaning (Office Garner), Retail & Wholesale (Fuelman Fleet), Building & Industrial (Grainger), Starter Cards (Capital Starter), Revolving Cards (Brex), General Cards (Ramp).

## 4. Dashboard
- "Unlock next" locked cards now show the **unlock-reason** line under the description (same derived logic as Account Matches).
- "Currently available to you" now includes `recommended` + `available` accounts.

## New state (in the `Component` logic class)
```
selectedOptions: {}   // fixKey -> chosen option name
proofSaved: {}        // fixKey -> bool
accountsTab: 'all'    // 'all' | 'vendor' | 'cards'
```
## New handlers
`markProgress(key)`, `selectOption(key, name)`, `saveProof(key)`, `setAccountsTab(t)`, `scrollToId(id)`, `doItMyself()`.

## Data model summary (what to wire to live data)
- `FIXES[key]` — fix content incl. `requires`-style checklist, `options[]`, `issue`, `scanSource`, `impactLevel`.
- `ACCOUNTS[]` — `{name, category, type, requires:[fixKey], pref, why, timing, grad}`. Status is **always derived**; don't store it.
- `fixStatus{}` — the single source of truth (`todo|progress|done`). Persist per member; everything else derives from it + the scan result.
