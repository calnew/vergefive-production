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
