# Verge Five billing route canonicalization

Verge Five is staying on Cloudflare.

To prevent duplicate Stripe checkout sessions and duplicate subscription creation, the canonical billing path is now the existing Cloudflare billing backend:

- Checkout creator: `/api/billing/create-checkout-session`
- Customer portal: `/api/billing/create-portal-session`
- Stripe webhook: `/api/billing/webhook`
- Checkout success/access recovery: `/api/billing/checkout-success`
- Access email: `/api/billing/send-access-email`

The newer Next.js Stripe routes are not allowed to create checkout sessions:

- `/api/stripe/checkout` returns `410` and points to `/api/billing/create-checkout-session`.
- `/api/stripe/portal` returns `410` and points to `/api/billing/create-portal-session`.
- `/api/stripe/webhook` returns `200` ignored so Stripe does not retry if the endpoint was accidentally configured, but it does not mutate membership or billing records.

The checkout UI posts to `/api/billing/create-checkout-session` and sends `annual` or `monthly` as the billing plan expected by the existing Cloudflare backend.

This keeps the old working Cloudflare/D1 billing system as the active source while the new layout/admin work continues.
