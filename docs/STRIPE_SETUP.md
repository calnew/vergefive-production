# Verge Five Stripe test setup

Create these Stripe test-mode prices and add the IDs to the environment.

- Self-Serve product
  - `STRIPE_PRICE_SELF_SERVE_YEARLY`: $297/year recurring
  - `STRIPE_PRICE_SELF_SERVE_MONTHLY`: $29/month recurring
- Done-With-You product/price
  - `STRIPE_PRICE_DONE_WITH_YOU`: $997 one-time

Checkout behavior:

- Self-Serve starts a subscription checkout with the selected yearly or monthly price.
- Done-With-You starts a subscription checkout with Self-Serve plus the $997 one-time price on the first invoice.

Webhook endpoint:

- `/api/stripe/webhook`
- Events needed: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

Compliance language:

Verge Five sells readiness tools and guided fixes. It does not guarantee approvals, funding, or lender decisions.