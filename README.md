# Verge Five migration application

Verge Five is a Next.js App Router prototype for business credit readiness. The flow is:

Landing page -> free scan -> gated teaser -> Stripe checkout -> full paid platform loop.

The product language is readiness-focused. It does not promise approvals, funding, account terms, or lender decisions.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Cloudflare OpenNext Worker
- Cloudflare D1 (`vergefive-members-dev` in development)
- Existing `vf_session` authentication and D1 membership records
- Stripe Checkout, Billing Portal, and webhooks

## Local setup

1. Install the locked dependencies:

```bash
npm ci
```

2. Run the source-of-truth checks and build:

```bash
npm run check:environment
npm run check:vertical-slice
npm run lint
npm run build
```

3. Start a local UI server when needed:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3010
```

Authenticated functional QA runs on the isolated deployed dev Worker because D1 bindings and secrets are Cloudflare environment resources. Create disposable QA members through the dev registration flow; never publish or reuse shared credentials.

## Product flow

1. Public visitor lands on `/`.
2. Visitor runs the free scan at `/scan`.
3. Free scan result appears at `/scan/results` with score, grade, issue titles, and a gated teaser.
4. Upgrade starts at `/signup?plan=self-serve` or `/checkout?plan=self-serve&billing=yearly`.
5. Stripe webhook updates the canonical D1 membership record.
6. Paid member enters `/dashboard`.
7. Member opens an issue from `/fix-list` or `/fix/[key]`.
8. Member marks the fix complete.
9. Readiness score rises and matching accounts move from unlock-next to ready-now.
10. Member reviews `/account-matches`, `/buildout`, and downloads `/report-card`.

## Gating rules

Paid platform routes are protected in middleware and server UI:

- `/dashboard`
- `/fix-list`
- `/fix/[key]`
- `/account-matches`
- `/buildout`
- `/report-card`
- `/account/settings`

Users with `free` entitlement are redirected to `/upgrade`. Canceled or unpaid Stripe subscription events downgrade the user to `free`, which sends them back to the upgrade UX.

## Stripe setup

Use Stripe test-mode prices that mirror the currently approved offer. Pricing is a business-controlled setting and must not be invented or hard-coded in migration documentation.

Webhook endpoint:

```text
/api/billing/webhook
```

Canonical checkout endpoint:

```text
/api/billing/create-checkout-session
```

The newer `/api/stripe/checkout` route is disabled so only the Cloudflare billing backend can create Stripe Checkout sessions.

Events handled:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Do not expose Stripe secret keys client-side.

## Deploy to the isolated Cloudflare dev environment

Push a reviewed branch and merge it into `scan-first-platform-redesign`. GitHub Actions verifies the app, resolves the dedicated `vergefive-members-dev` D1 database, applies the additive D1 schema, and deploys `vergefive-next-dev`.

Do not run local Wrangler deploy or upload commands. Production promotion is a separate GitHub-controlled action and requires Bill's explicit approval for the exact release-candidate SHA.

## Compliance note

All account and payment views must keep this position: Verge Five improves business credit readiness and account-match sequencing. It does not guarantee approvals, funding, account terms, or lender decisions.

