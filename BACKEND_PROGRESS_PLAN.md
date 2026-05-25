# Verge Five Member Progress Backend Plan

## Current State

The Verge Five build now includes the first production membership backend layer for Cloudflare Pages:

- Custom email/password account creation and login through Pages Functions.
- Email verification token creation, verification endpoint, and resend endpoint.
- Cloudflare Turnstile hooks on signup and login once the Turnstile keys are configured.
- HttpOnly session cookies stored against hashed session tokens in D1.
- Stripe Checkout session creation.
- Stripe Customer Portal session creation.
- Stripe webhook handling for checkout completion, subscription updates, deleted subscriptions, and failed payments.
- Middleware protection for member pages and member APIs.
- Admin-only member reporting at `/admin/`, controlled by `ADMIN_EMAILS`.
- Affiliate tracking, referral attribution, and manual commission reporting.
- D1 schema for users, sessions, memberships, business profiles, progress, matcher signals, resume location, and report snapshots.

The older browser `localStorage` progress behavior still exists as a front-end fallback. The frontend now bridges that local state into the member APIs after login.

## Production Requirement

Cloudflare-native stack:

- Cloudflare Pages for the frontend.
- Cloudflare Pages Functions or Workers for API routes.
- Cloudflare D1 for member profile and progress storage.
- Custom email/password authentication for this MVP.
- Stripe Checkout and Billing Portal for paid membership.
- Stripe webhooks as the source of truth for payment status.
- Recommended hardening before heavy traffic: configure Turnstile keys, configure email delivery, enable required email verification, and add password reset.

## Data To Persist

Store member state without exposing proprietary lesson content in reports or downloads.

- User account identity.
- Business profile fields captured at the beginning of the program.
- Current module/page path for resume.
- Checklist completion status by page and item index.
- Vendor readiness matcher selections.
- Credit card matcher selections.
- Funding matcher selections.
- Generated progress report snapshots.
- Login and progress audit timestamps.
- Affiliate referral source and commission status when a member signs up through an affiliate link.

## Affiliate Rules

- Affiliate links use `?ref=<code>`.
- The browser stores the referral for 60 days.
- Signup saves the referral code to the member account if it matches an active affiliate.
- Stripe Checkout receives affiliate metadata.
- Stripe webhooks create and update commission records.
- Annual membership pays `$60` per paid annual signup.
- Monthly membership pays `$60` only after 3 successful monthly payments.
- Admin marks payable commissions as paid manually.

## D1 Tables

The schema has been added at `schema/member-progress.sql`.

```sql
create table users (
  id text primary key,
  email text not null unique,
  name text,
  created_at text not null,
  last_login_at text
);

create table business_profiles (
  user_id text primary key references users(id),
  business_name text,
  entity_type text,
  formation_state text,
  phone text,
  address text,
  website text,
  email text,
  bank integer default 0,
  directory_411 integer default 0,
  bureau_profile integer default 0,
  vendor_tradelines integer default 0,
  funding_reserve integer default 0,
  updated_at text not null
);

create table lesson_progress (
  user_id text not null references users(id),
  page_path text not null,
  completed_indexes text not null default '[]',
  last_opened_at text not null,
  primary key (user_id, page_path)
);

create table readiness_signals (
  user_id text not null references users(id),
  signal_type text not null,
  selected_keys text not null default '[]',
  updated_at text not null,
  primary key (user_id, signal_type)
);

create table report_snapshots (
  id text primary key,
  user_id text not null references users(id),
  report_type text not null,
  readiness_stage text,
  summary_json text not null,
  created_at text not null
);
```

## Suggested API Routes

- `POST /api/auth/register`
  - Creates a member account and session.
- `POST /api/auth/login`
  - Creates a session.
- `POST /api/auth/logout`
  - Deletes the current session.
- `GET /api/auth/me`
  - Returns the authenticated member and saved resume location.
- `POST /api/billing/create-checkout-session`
  - Creates a Stripe Checkout subscription session for `monthly` or `annual`.
  - Monthly uses `STRIPE_PRICE_ID_MONTHLY` or falls back to `STRIPE_PRICE_ID`.
  - Annual uses `STRIPE_PRICE_ID_ANNUAL` for the $497/year plan.
- `POST /api/billing/create-portal-session`
  - Creates a Stripe Customer Portal session for members with a linked Stripe customer.
- `POST /api/billing/webhook`
  - Receives Stripe subscription/payment lifecycle events.
- `GET /api/member/profile`
  - Loads the member's business profile.
- `PUT /api/member/profile`
  - Saves the member's business profile.
- `GET /api/member/progress`
  - Loads all page progress and readiness signals for the member.
- `PUT /api/member/progress`
  - Saves current page progress and last opened path.
- `PUT /api/signals/:type`
  - Saves vendor, card, or funding matcher selections.
- `POST /api/member/reports`
  - Saves a server-side report snapshot.

## Frontend Sync Behavior

The current `localStorage` behavior can remain as an offline fallback, but after login the frontend should:

1. Load server state from `/api/profile` and `/api/progress`.
2. Merge any newer local browser changes into the server record.
3. Save page progress whenever a checklist item changes.
4. Save `last_opened_path` whenever a member opens a lesson.
5. Show the dashboard resume panel from server state when logged in.
6. Generate reports from the same readiness summary logic while keeping lesson content proprietary.

## Remaining Backend Sequence

1. Create the Cloudflare D1 database.
2. Apply `schema/member-progress.sql`.
3. Add the D1 binding named `DB` to the Pages project.
4. Add the Stripe environment variables/secrets.
5. Create a Stripe product/price and webhook endpoint.
6. Deploy to a preview URL and test register -> checkout -> webhook -> protected dashboard.
7. Sync the existing `localStorage` profile/progress/checklist state into `/api/member/profile` and `/api/member/progress`.
   - Status: front-end bridge added in `public/Scripts/vf-redesign.js`.
   - The browser now loads server profile/progress after login, merges it with local state, keeps local progress as the offline fallback, saves profile intake changes to `/api/member/profile`, saves checklist/resume progress to `/api/member/progress`, and persists vendor/card/funding matcher selections as readiness signals.
8. Configure Cloudflare Turnstile keys and test signup/login token verification.
   - Status: blocked on secret values. Production Pages secrets currently do not list `TURNSTILE_SITE_KEY` or `TURNSTILE_SECRET_KEY`.
   - Code status: `/api/config` now exposes safe readiness flags for Turnstile/email configuration without exposing secret values.
9. Configure email delivery and set `REQUIRE_EMAIL_VERIFICATION=true` after test emails arrive correctly.
   - Status: blocked on Resend values. Production Pages secrets currently do not list `RESEND_API_KEY` or `EMAIL_FROM`.
10. Add password reset before opening broad paid access.
   - Status: complete. Added password reset token storage, request/reset auth endpoints, email helper, login link, and `/forgot-password/` + `/reset-password/` pages. Remote D1 now includes `password_reset_tokens`.

## Report Privacy Rule

Reports should show:

- What the member has completed.
- What profile items are in place.
- Current readiness stage.
- Likely qualification paths.
- Recommended next actions.

Reports should not show:

- Full lesson plans.
- Lesson checklist wording.
- Vendor strategy details.
- Proprietary training instructions.
- The platform's internal lesson order beyond broad progress status.


## Production secret check - 2026-05-22

Wrangler confirmed production Pages secrets exist for ADMIN_EMAILS, SITE_URL, STRIPE_PRICE_ID, STRIPE_PRICE_ID_ANNUAL, STRIPE_SECRET_KEY, and STRIPE_WEBHOOK_SECRET. Missing for the hardening pass: TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY, RESEND_API_KEY, EMAIL_FROM, and optional STRIPE_PRICE_ID_MONTHLY if the monthly plan should not use the STRIPE_PRICE_ID fallback.


## Password reset preview QA - 2026-05-22

Preview branch backend-progress passed a live password-reset flow against remote D1: registered a temporary QA user, requested a password reset, verified a reset token was created in password_reset_tokens, reset the password, logged in with the new password, and removed the temporary QA user. A follow-up D1 count confirmed 0 remaining qa-reset-*@example.com users.


## Member persistence preview QA - 2026-05-22

Preview branch backend-progress passed a live member persistence flow against remote D1: registered a temporary QA user, saved /api/member/profile, saved lesson progress/resume through /api/member/progress, saved vendor readiness signals, reloaded profile/progress successfully, and removed the temporary QA user. A follow-up D1 count confirmed 0 remaining qa-sync-*@example.com users.


## Stripe checkout preview QA - 2026-05-22

Preview branch backend-progress registered a temporary checkout QA user, but monthly and annual checkout session creation returned configuration errors because the preview Functions environment did not expose the Stripe price IDs. The temporary QA user was removed and a follow-up D1 count confirmed 0 remaining qa-checkout-*@example.com users. Production secret listing shows Stripe secrets on the production environment, but preview branch testing needs matching preview environment variables/secrets before checkout can be verified there.


## Report snapshot preview QA - 2026-05-23

Preview branch backend-progress passed a live report snapshot flow against remote D1 for an active temporary QA member: registered user, promoted membership for QA, saved a report snapshot through POST /api/member/reports, loaded it through GET /api/member/reports, and removed the temporary QA user. A follow-up D1 count confirmed 0 remaining qa-report-*@example.com users. Trial-gated behavior was also confirmed: trial users receive Upgrade to unlock this member tool. for report snapshot APIs.

## Account report history preview QA - 2026-05-23

Preview branch `backend-progress` passed the authenticated account report-history check against remote D1. A temporary QA member was registered, promoted to active membership, used to save a progress report through `POST /api/member/reports`, confirmed through `GET /api/member/reports`, and loaded `/account/` with the same session. The account page returned HTTP 200 and included the `data-report-history` panel and report history label. Temporary `qa-account-*` data was removed; the follow-up D1 count confirmed 0 remaining QA account users.


## Admin member detail preview deploy - 2026-05-23

Preview branch backend-progress now includes an admin-only member detail endpoint at /api/admin/member?id=..., plus a detail panel on /admin/ with saved profile, resume, progress, readiness signals, and report snapshots. Middleware was corrected so unauthenticated admin API requests return JSON 403 instead of the login page. Deployed preview: https://7a853404.vergefive.pages.dev. Verification note: admin success-path rendering is blocked until ADMIN_EMAILS is aligned with a usable login account; temporary D1 QA sessions/users were removed after 403 checks.
