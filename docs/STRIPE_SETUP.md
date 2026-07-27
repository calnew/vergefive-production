# Verge Five Stripe test setup

Create these Stripe test-mode recurring prices and add the IDs to environment vars.

- Monthly plan price: `STRIPE_PRICE_ID` **or** `STRIPE_PRICE_ID_MONTHLY` (optional explicit override)
- Annual plan price: `STRIPE_PRICE_ID_ANNUAL`

Notes:

- `STRIPE_PRICE_ID` is the canonical fallback for the monthly plan when
  `STRIPE_PRICE_ID_MONTHLY` is not set.
- If you do not use `STRIPE_PRICE_ID_MONTHLY`, keep it unset and rely on
  `STRIPE_PRICE_ID` only.

Checkout behavior:

- Membership checkout uses:
  - `/api/billing/create-checkout-session` for monthly (`STRIPE_PRICE_ID_MONTHLY` or fallback `STRIPE_PRICE_ID`) and
  - `/api/billing/create-checkout-session` for annual (`STRIPE_PRICE_ID_ANNUAL`).

Webhook endpoint:

- `/api/billing/webhook`
- Events needed: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

Compliance language:

Verge Five sells readiness tools and guided fixes. It does not guarantee approvals, funding, or lender decisions.

Production vs. Dev naming:

- Production already uses the canonical variable names above.
- Dev/Preview must use the same names so canonical billing routes stay identical:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PRICE_ID`
  - `STRIPE_PRICE_ID_ANNUAL`
  - optional `STRIPE_PRICE_ID_MONTHLY` (to force a separate monthly override)

## GitHub-managed dev configuration

Do not run local Wrangler secret or deployment commands. GitHub Actions is the
only deployment path.

Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to the protected
`vergefive-dev` GitHub environment. Configure the following names on the
`vergefive-next-dev` Worker through the reviewed dev setup process:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- `STRIPE_PRICE_ID_ANNUAL`
- optional `STRIPE_PRICE_ID_MONTHLY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SITE_URL`
- `ADMIN_EMAILS`

Dev accepts Stripe test-mode values only. Never place `sk_live_`, live Price
IDs, production email routing, or production member data in the dev Worker.
Production configuration is separate and is changed only through an explicitly
approved production release.
