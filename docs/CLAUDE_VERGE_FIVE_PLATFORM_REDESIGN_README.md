# Handoff: Verge Five Member Platform Redesign

## Overview
A redesign of the Verge Five business-credit member platform from a course/library layout into a **guided, scan-first, action-first SaaS command center**. The product idea: *Run the scan. Fix what matters. Unlock the right accounts when your business is ready.*

The prototype is one connected, clickable app with eight routable screens driven by a single client-side router. The underlying site functionality is already live — **this package is the new front-end framework/layout to rebuild**, not new backend logic.

## About the Design Files
The file in this bundle (`Verge Five Platform.dc.html`) is a **design reference created in HTML** — a working prototype showing the intended look, structure, and behavior. It is **not production code to ship directly**.

The task is to **recreate these screens in your existing codebase** (React/Next/Vue/etc.) using your established component patterns, routing, and data layer. All copy, layout, colors, and interactions below are exact and should be matched. Wire the screens to your live data where the prototype uses mock data (see **State Management**).

> Note on the file format: the prototype is authored as a self-contained "Design Component" — markup in the file, a `class Component` logic block holding all data + handlers, and a small runtime (`support.js`). You do **not** need to keep this format. Read it as a spec: the logic block is effectively the data model + controller; the markup is the view. Re-implement both in your stack.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and interactions are specified. Recreate the UI to match using your codebase's libraries and patterns.

## Global Layout & Shell
- **Two-column app shell:** fixed left sidebar (248px) + fluid main column.
- **Sidebar** (`#0E1A2B` navy, sticky full-height, right border `#1b2c46`, padding 24px 16px):
  - Logo lockup: 36×36 rounded-9px gradient tile `linear-gradient(135deg,#2563EB,#3b82f6)` with white "V5" (Space Grotesk 700, 18px); wordmark "Verge Five" (Space Grotesk 700, 16px, `#fff`) + "BUSINESS CREDIT" label (11px, 700, `#6f8099`).
  - Nav items (6): **Dashboard, Run Scan, Fix List, Account Matches, Full Buildout, Support**. Each is a full-width button, 11px 14px padding, radius 10px, 14px/600 text, line icon (19px, stroke `currentColor`). Inactive: text `#9fb0ca`, transparent bg. Active: text `#fff`, bg `#1b2c46`. Hover: bg `#16263d`, text `#fff`.
  - Footer: "Mobile preview" outline button (opens mobile screen) + member card (`#13243c`, radius 12px): 38px circle avatar with initials "MB", member name `#fff` 13px/700, business `#7b8ca8` 11.5px.
- **Header** (sticky, `rgba(241,244,249,.85)` + 10px backdrop blur, bottom border `#e2e8f2`, padding 18px 36px): left = uppercase kicker (12px/700, `#8a97ab`, letter-spacing .4px) above page title (Space Grotesk 700, 23px, `#0F1B2D`). Right = action buttons: **Back to Dashboard** (shown on fix/accounts/buildout/support — not dashboard or scan), **Get Help**, **Run Scan**.
  - Secondary button style: `#fff` bg, 1px `#d6deea` border, `#33425a` text, 9px 14px, radius 10px, 13px/600; hover border + text `#2563EB`.
  - Primary button style: `#2563EB` bg, white, 10px 16px, radius 10px, 13px/700, shadow `0 6px 16px rgba(37,99,235,.32)`; hover `#1d4ed8`.
- **Content area:** max-width 1180px, centered, padding 32px 36px 56px, page background `#F1F4F9`.

## Screens / Views

### 1. Dashboard (`/dashboard/`)
Primary logged-in landing. Vertical stack (gap 22px):
- **Greeting:** "Welcome back, {memberName}" (Space Grotesk 700, 27px). Subline: "{businessName} · Assigned path: {path}" with path in `#2563EB`/700.
- **Hero row** (grid 1.35fr / 1fr, gap 18px):
  - *Run My Scan* card — navy gradient `linear-gradient(135deg,#0E1A2B,#1c3355)`, radial blue glow top-right, white text. Kicker "START HERE", title "Run My Scan", copy "Find what is holding your business back — and exactly what to fix first.", primary button "Run My Scan →".
  - *Explore Full Buildout* card — white, 1px `#E5EAF1`, radius 18px. Kicker "FOR THE FULL PATH", title, copy, outline button "Explore buildout →".
- **Readiness + Profile row** (grid 1fr/1fr):
  - *Business Readiness* — white card, left = progress ring (see Components), right = "Business Readiness" kicker, score label (Space Grotesk 700, 21px, color = ring color), supporting copy referencing % complete and "Ready for Account Match Review".
  - *Profile Progress* — white card: big % (Space Grotesk 700, 30px), 10px progress bar (track `#EAEEF4`, fill `linear-gradient(90deg,#2563EB,#3b82f6)`), two mini stat tiles (Fixes done `#15803D`, Open fixes `#B45309`).
- **Your Next 3 Actions** — white card. Header + "View full fix list →" link. Each row: number chip, title (15px/700), impact badge, reason (`#5B6B82` 13px), buttons **Do It Myself** (primary) + **Get Help** (secondary).
- **Account Access** — white card. "Currently available to you" (green uppercase label) → 3-col grid of account cards. "Unlock next" (amber label) → 3-col grid of locked cards. See Account Card component.
- **Help CTA** — gradient banner `linear-gradient(120deg,#eef4ff,#f3f7ff)`, border `#d9e6fb`: "Need help getting things done?" + "See How We Can Help" primary button.

### 2. Business Visibility Audit / Run Scan (`/ai-visibility-audit/`)
The engine of the platform.
- **Summary card** — navy gradient, kicker "THE ENGINE OF VERGE FIVE", title "Business Visibility Audit", explanation copy, large primary button ("Run Scan Now" → "Re-run Scan" after first run).
- **Pre-scan state** (before scan run): white card "We'll scan this business profile" + 3-col grid of read-only profile fields (Business name, Phone, Address, Website, EIN, Bank account).
- **Result state** (after Run Scan), grid 300px / 1fr:
  - *Scan Result* card — large progress ring (160px) with score (Space Grotesk 700, 42px) + score label + "Recommended path" tile.
  - *Detected issues* card — list of issues, each: colored severity dot, title + detail, severity badge (High `#FBE9E9`/`#DC2626`, Medium `#FCF1E2`/`#B45309`), "Fix this →" button routing to the matching fix page.

**Scan-result routing** (issue → fix page): phone/411 → `/phones-and-411/`; address → `/business-address/`; website/email → `/website-domain-email/`; entity → `/llc-vs-corporation/`; EIN → `/ein/`; banking → `/bank-account/`; bank rating → `/bank-rating/`; criteria → `/business-credit-criteria/`; net 30 → `/about-net-30/`; vendors → office/building/retail pages; cards → revolving/starter/general pages; help → `/support/`.

### 3. Fix List (`/start-here/`)
- Summary card with done/open counts.
- Grouped by phase (Phase 1 Foundation, Phase 2 Legal & Banking, Phase 3 Credit Readiness). Each phase card lists fix rows: status badge, title + tagline, impact badge, **Open** button → fix detail.

### 4. Fix Page template (generic — drives all `/phones-and-411/`, `/business-address/`, etc.)
Data-driven: one template renders any fix by key. Grid 1fr / 320px.
**Left column:**
1. *Top Action Panel* — status badge + route, title (Space Grotesk 700, 25px), tagline, "Why it matters" callout (left border `#2563EB`, bg `#F4F7FC`), action buttons: **Mark Complete** (turns green "Marked Complete ✓" when done), **Get Help**, **Back to Dashboard**, **Run Scan**.
2. *What to fix* — checklist (unchecked 20px square boxes, `#cdd9ec` border).
3. *Do this first* — numbered steps (blue 26px number circles).
4. *Recommended setup options* — 2-col grid of option cards (name + tag chip + description). Replaces old "services offered" sections.
5. *Short training / video* — compact 200×118 video thumbnail (navy gradient + play button + duration) beside "Watch if you need more context" + bullet summary. Video is secondary/small by design.
**Right rail (sticky):**
6. *Proof to save* — green-check checklist + dashed "+ Upload document" button.
7. *What this unlocks* — navy card listing downstream unlocks (green checks).
8. *Next step* — name of next fix + "Go to next fix →" button.

### 5. Account Matches (`/revolving-business-credit-cards/`, `/starter-cards/`, vendor pages, etc.)
- Intro card.
- "Available to you" (green label) → 3-col grid. "Unlock next" (amber label) → 3-col grid of locked cards (with lock icon over the card header).
- All cards use the **same credit-card-style frame** (see Component). Each shows: card-header band (color by type, EMV-chip graphic), type chip, name, status badge, why-it-matches copy, requirements checklist, timing, and **Apply / Get Help** (available) or **Get Help to unlock** (locked).

### 6. Full Buildout (`/full-buildout/`)
Optional deep path. Navy hero ("Explore the complete business credit buildout"). Then 5 phases, each with module cards (2-col). Module card: tag (M1–M7) + title, status badge, purpose, "Required fixes" chips, "Related scan issue", and an action button (open fixes / view account matches). 5 phases / 7 modules — **do not add an 8th module.**

### 7. Support / Get Help (`/support/`)
Centered 680px form:
- Prefilled read-only tiles: **Fix area** (`#2563EB`) and **Page route** — both passed in from wherever Get Help was clicked.
- Textarea "What would you like us to handle?" + Priority `<select>` (Standard / Priority / Urgent).
- "Submit request" primary button → confirmation state: green check, "Request received", "Your request is tied to this fix area: {area} · {route}", buttons back to dashboard / fix list.

### 8. Dashboard Mobile (phone frame)
Reached via sidebar "Mobile preview". Renders a 380px phone bezel containing the mobile-priority order: **score → next action → Run Scan → available accounts → Get Help → Full Buildout (lower)**, plus a bottom tab bar (Home / Scan / Accounts / Help). On real mobile, collapse the desktop sidebar into this bottom tab bar; do not endlessly stack the desktop layout.

## Interactions & Behavior
- **Routing:** single-page; sidebar nav, header buttons, and in-content links all switch the active screen. `window.scrollTo(0,0)` on navigation.
- **Run Scan:** sets scan-complete state and navigates to the scan result. CTA label toggles to "Re-run Scan".
- **Mark Complete:** sets that fix's status to `done`. This **raises the readiness score and profile %, updates the dashboard's Next 3 Actions, and advances module statuses** in Full Buildout — all derived, in real time.
- **Get Help (anywhere):** routes to Support with the fix area + originating route prefilled.
- Hover states on every button/card/row as specified above.
- No entrance animations (kept off intentionally for stability); only the progress-ring stroke transitions (`stroke-dashoffset .7s ease`) and progress-bar width (`.6s`).

## State Management
All state lives in one controller (`class Component`). Replace mock values with live data:
- `member` (string), `business` (string), `memberInitials` — from the member/business profile.
- `fixStatus` — map of fix key → `'todo' | 'progress' | 'done'`. **This is the core state.** Persist per member.
- `scanComplete` (bool) — whether a scan has been run.
- `supportArea`, `supportRoute`, `supportSubmitted` — support form context.
- `activeFix` — which fix the fix-detail screen shows.
- **Derived (recompute, don't store):**
  - `score = min(96, 40 + doneCount*6 + inProgressCount*2)` → label: <50 Needs Work (`#DC2626`), <65 Fair (`#D97706`), <80 Good (`#2563EB`), ≥80 Ready for Account Match Review (`#15803D`).
  - `profileProgress = round(40 + doneCount*7)`.
  - `assignedPath`: ≥80 Account Match Review, ≥65 Credit Card Readiness, ≥50 Visibility Cleanup, else Foundation Fixes.
  - Next 3 actions = first 3 non-`done` fixes in canonical order.
- **Data fetching to wire:** member/business profile, saved fix statuses + proof uploads, scan engine result (score + detected issues — currently canned), account-match eligibility (currently static list), support ticket submission.

## Design Tokens
**Colors**
- Sidebar navy `#0E1A2B`; navy-2 `#13243c`/`#16263d`; sidebar border `#1b2c46`; active nav bg `#1b2c46`; nav text `#9fb0ca`.
- Primary blue `#2563EB`; primary hover/dark `#1d4ed8`; light blue accent `#3b82f6`; navy-on-light gradient end `#1c3355`/`#1d3a64`.
- Page bg `#F1F4F9`; card bg `#FFFFFF`; card border `#E5EAF1`; soft border `#EAEEF4`; inner tile bg `#F4F7FC`.
- Text: heading `#0F1B2D`; body `#34435c`; muted `#5B6B82`; label `#8a97ab`.
- Success green `#15803D` on `#E7F4EC`. Amber/locked `#B45309` on `#FCF1E2`. High-impact red `#DC2626` on `#FBE9E9`. Neutral badge `#5B6B82` on `#EEF1F6`. Blue badge `#2563EB` on `#EEF3FE`.
- Account-card header gradients by type: Net 30 `linear-gradient(135deg,#2563EB,#3b82f6)` / `#1d4ed8→#2563EB`; Vendor `linear-gradient(135deg,#0e7490,#0891b2)`; locked `#9aa7bd`. EMV chip `linear-gradient(135deg,#f4d98b,#d8b25a)`.

**Typography**
- Display/headings: **Space Grotesk** (500/600/700). UI/body: **Plus Jakarta Sans** (400/500/600/700/800). Both Google Fonts — swap to your codebase's equivalents if you have them.
- Scale in use: page title 23px/700; section title 16–19px/700; card title 15–17px/700; body 13–15px; labels 11–12px/700 uppercase, letter-spacing .3–.5px; big numbers 30–42px Space Grotesk 700.

**Radius / Shadow / Spacing**
- Radius: cards 16–18px; buttons/inputs 9–12px; pills/badges 20px; nav items 10px.
- Shadows: primary button `0 6px 16px rgba(37,99,235,.32)`; hovered account card `0 10px 28px rgba(15,27,45,.08)`; phone bezel `0 30px 70px rgba(0,0,0,.5)`.
- Common gaps: 14–22px between cards; content padding 24–26px inside cards.

**Progress ring** — SVG 132 viewBox, r=58, stroke-width 12, track `#EAEEF4`, progress stroke = score color, `stroke-linecap:round`, rotated -90°, `stroke-dasharray = 2π·58`, `stroke-dashoffset = circ·(1 − score/100)`.

## Assets
- **Icons:** inline SVG line icons (stroke = currentColor) — nav, checkmarks, lock, search, play, help. No icon library dependency; substitute your own set 1:1.
- **Images:** none. Video thumbnails are CSS gradient placeholders — wire to real training videos (kept deliberately small/secondary).
- **Logo:** "V5" gradient tile + wordmark, built in CSS — replace with the real Verge Five logo.
- **Fonts:** Space Grotesk + Plus Jakarta Sans via Google Fonts.

## Files
- `Verge Five Platform.dc.html` — the full prototype (all 8 screens, router, mock data, and handlers). The `class Component` block near the bottom contains the data model (`FIXES`, `ACCOUNTS`, phase/module definitions) and all derived logic; the markup above it is the view for each screen, gated by `<sc-if>` per route.
