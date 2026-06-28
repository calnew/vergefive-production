# Verge Five Prototype

Verge Five is a Next.js App Router prototype for business credit readiness. The flow is:

Landing page -> free scan -> gated teaser -> Stripe checkout -> full paid platform loop.

The product language is readiness-focused. It does not promise approvals, funding, account terms, or lender decisions.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- Postgres
- Auth.js credentials auth
- Stripe Checkout, Billing Portal, and webhooks

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`.

Required environment variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/vergefive?schema=public"
AUTH_SECRET="replace-with-a-long-random-secret"
AUTH_URL="http://localhost:3010"
NEXT_PUBLIC_APP_URL="http://localhost:3010"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_SELF_SERVE_YEARLY="price_..."
STRIPE_PRICE_SELF_SERVE_MONTHLY="price_..."
STRIPE_PRICE_DONE_WITH_YOU="price_..."
```

3. Run migrations and seed the demo account:

```bash
npx prisma migrate dev
npm run db:seed
```

Seeded paid demo user:

```text
demo@vergefive.com
VergeFiveDemo123!
```

4. Start local dev:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3010
```

5. Build check:

```bash
npm run build
```

## Product flow

1. Public visitor lands on `/`.
2. Visitor runs the free scan at `/scan`.
3. Free scan result appears at `/scan/results` with score, grade, issue titles, and a gated teaser.
4. Upgrade starts at `/signup?plan=self-serve` or `/checkout?plan=self-serve&billing=yearly`.
5. Stripe webhook updates `User.entitlement` to `self_serve` or `done_with_you`.
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

Create Stripe test-mode prices:

- Self-Serve yearly recurring: `$297/year`
- Self-Serve monthly recurring: `$29/month`
- Done-With-You one-time: `$997`

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

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import the repo in Vercel.
3. Add all environment variables listed above.
4. Set the build command to:

```bash
npm run build
```

5. Set the install command to:

```bash
npm install
```

6. Run Prisma migrations against the deployed database before sending traffic.
7. Add the deployed webhook URL in Stripe and copy the live/test webhook secret into Vercel.

## Compliance note

All account and payment views must keep this position: Verge Five improves business credit readiness and account-match sequencing. It does not guarantee approvals, funding, account terms, or lender decisions.

