# Verge Five canonical backend data model migration map

This document maps the older Cloudflare Pages Functions / D1 backend concepts into the new canonical Next.js + Prisma/Postgres backend.

## Architecture decision

- New source of truth: Next.js App Router + Prisma/Postgres + Auth.js.
- Canonical Stripe path: `/api/stripe/*`.
- Old Cloudflare Functions/D1 backend remains as a reference until feature parity is complete.
- Member-facing pages must not mention AI. Internal fields may keep implementation-oriented names only where needed.
- Access and billing are separate: `User.entitlement` and `User.billingStatus`, plus the detailed `Membership` record.

## Old D1 table to new Prisma model map

| Old D1 table / concept | New Prisma destination | Notes |
|---|---|---|
| `users` | `User` | Preserves identity. Adds `billingStatus`, `authProvider`, verification and login timestamps. |
| `sessions` | Auth.js session/JWT layer | Not modeled as a canonical table for now unless database sessions are later chosen. |
| `memberships` | `Membership`, `Subscription`, `Purchase`, `User.entitlement`, `User.billingStatus` | Access is separated from payment state so legacy paid members can keep access without a new Stripe subscription. |
| `email_verification_tokens` | `EmailVerificationToken` | Canonical token model for email verification. |
| `password_reset_tokens` | `PasswordResetToken` | Canonical token model for invites and resets. |
| `business_profiles` | `Business` | Existing `Business` is expanded with legal/trade name, formation state, EIN, industry, and updated timestamp. |
| `lesson_progress` | `Issue.status`, future lesson/progress model if needed | The immediate product loop uses `Issue`; old page-level lesson progress should be reconsidered after the 5-module flow is finalized. |
| `readiness_signals` | `Scan.signals`, `VisibilityAudit.signals`, `CatalogAccount.recommendedSignals` | Preserved as structured JSON on scan/audit/catalog models. |
| `resume_locations` | Future member preference/resume field | Not modeled separately yet; can be added if resume UX returns. |
| `report_snapshots` | `ReportSnapshot` | Stores saved report/download summaries without exposing proprietary lesson content. |
| `visibility_audits` | `VisibilityAudit` | Preserves source mode, engine, evidence, findings, red flags, recommendation, and raw result JSON. |
| `member_access_events` | `MemberAccessEvent` | Preserves page-view/access audit trail. |
| `member_readiness_locks` | `MemberReadinessLock` | Preserves advanced-section lock/review/settling logic if retained. |
| `member_preferences` | Not canonical yet | Add later only if the member guide/resume preference is still needed. |
| `support_requests` | `SupportTicket` | Canonical queue for contact, support, and problem reports. |
| `admin_notes` | `AdminNote` | Member-level notes. |
| `admin_activity_log` | `AdminActivityLog` | Required for every future access, billing, destructive, email, or membership-changing admin action. |
| `legacy_campaigns` | `EmailCampaign`, `EmailTemplate` | Campaign copy becomes editable/admin-managed templates and campaigns. |
| `legacy_leads` | `EmailLead`, `ImportedUser` | Lead/contact tracking and old-user import records are separated but linked. |
| `affiliates` | `Affiliate` | Preserves affiliate profile and code. |
| `affiliate_referrals` | `AffiliateReferral` | Preserves referral attribution. |
| `affiliate_commissions` | `AffiliateCommission` | Preserves commission status and manual mark-paid path. |
| `affiliate_invoice_events` | `AffiliateInvoiceEvent` | Preserves invoice/payment dedupe for commission qualification. |
| `stripe_webhook_events` | `StripeEvent` | Existing model expanded with payload, processing status, and error field. |
| `rate_limits` | `RateLimit` | Canonical rate-limit bucket store if rate limiting remains DB-backed. |

## Migration impact summary

The schema expansion is additive. Existing canonical tables stay in place:

- `User`
- `Business`
- `Scan`
- `Issue`
- `AccountMatch`
- `StripeEvent`

The migration adds fields needed for imported users, memberships, billing state, scan evidence, report snapshots, email history, support tickets, admin audit logs, affiliates, and readiness locks.

## Important unresolved decisions

1. Auth session storage: keep Auth.js JWT sessions or move to database sessions later.
2. Lesson/page progress: the new app is issue/fix based; old page-level progress may need a separate model only if the 5-module lesson flow needs granular page resume.
3. Runtime: Prisma/Postgres on Cloudflare Workers may still require an edge-compatible database path or a Node/Vercel runtime decision before full backend deployment.
4. Stripe path retirement: old `/api/billing/*` should remain reference-only until `/api/stripe/*` includes duplicate-session protection, affiliate metadata, access-email recovery, and webhook parity.
5. Email events: open/click/delivery depends on Resend webhook support and provider event mapping.
