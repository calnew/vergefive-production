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

Live deployment rule (do not hardcode secrets in code):

- Cloudflare Pages stores these as encrypted secrets and does not expose values for readback, so set them in each env directly.
- Required production config is already present on `vergefive` production.
- Dev preview must be set by running:

  - `npx.cmd wrangler pages secret put STRIPE_SECRET_KEY --project-name vergefive --env preview`
  - `npx.cmd wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name vergefive --env preview`
  - `npx.cmd wrangler pages secret put STRIPE_PRICE_ID --project-name vergefive --env preview`
  - `npx.cmd wrangler pages secret put STRIPE_PRICE_ID_ANNUAL --project-name vergefive --env preview`
  - `npx.cmd wrangler pages secret put STRIPE_PRICE_ID_MONTHLY --project-name vergefive --env preview` (optional)

Use live `cs_live_*` or test `cs_test_*` `STRIPE_PRICE_ID*` values as appropriate per your target env; never expose keys client-side.

## Worker dev secret setup

The current Next.js Worker target is `vergefive-next-dev`. Cloudflare Pages production already has the live Stripe/email names, but encrypted secret values cannot be read back or copied out by Wrangler. Add the same names to the Worker explicitly.

For dev/test mode, provide Stripe test-mode values only:

```powershell
npx.cmd wrangler secret put STRIPE_SECRET_KEY
npx.cmd wrangler secret put STRIPE_WEBHOOK_SECRET
npx.cmd wrangler secret put STRIPE_PRICE_ID
npx.cmd wrangler secret put STRIPE_PRICE_ID_ANNUAL
npx.cmd wrangler secret put STRIPE_PRICE_ID_MONTHLY
npx.cmd wrangler secret put RESEND_API_KEY
npx.cmd wrangler secret put EMAIL_FROM
npx.cmd wrangler secret put SITE_URL
npx.cmd wrangler secret put ADMIN_EMAILS
```

Use `STRIPE_PRICE_ID_MONTHLY` for the monthly test Price, `STRIPE_PRICE_ID_ANNUAL` for the annual test Price, and keep `STRIPE_PRICE_ID` as the optional monthly fallback. Do not put `sk_live_` into the dev Worker.
