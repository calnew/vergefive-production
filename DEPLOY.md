# Verge Five Deployment Workflow

Cloudflare Pages is the source of truth for the deployed Verge Five site. Duda is intentionally shelved.

## Project

- Local project root: `D:\Cowork\veregefive\vergefive_cloudflare`
- Static deploy directory: `public/`
- Cloudflare account: `Turncomvoice@gmail.com`
- Account ID: `7e010843ac0f3d614b1b553011f47784`
- Pages project: `vergefive`
- Production Pages URL: `https://vergefive.pages.dev`
- Production custom domains: `https://vergefive.com` and `https://www.vergefive.com`
- R2 video bucket: `vergefive-videos`
- Active R2 video hostname: `https://pub-15820b1cee7544748132a3028ca4c32a.r2.dev`
- Preferred future R2 video hostname: `https://videos.vergefive.com`

## Prerequisites

1. Use a shell where Wrangler can run. On this Windows machine, call `npx.cmd` directly from PowerShell:

   ```powershell
   & 'C:\Program Files\nodejs\npx.cmd' wrangler --version
   & 'C:\Program Files\nodejs\npx.cmd' wrangler whoami
   ```

2. Confirm Wrangler is logged into the Cloudflare account above.

3. Confirm `vergefive.com` is active in Cloudflare DNS. As of this finalization pass, the zone existed but was still `pending`; the registrar nameservers must point to:

   - `andronicus.ns.cloudflare.com`
   - `love.ns.cloudflare.com`

## Deploy the static site

Run from the project root:

```powershell
cd D:\Cowork\veregefive\vergefive_cloudflare
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages deploy public --project-name vergefive --branch main
```

After deploy, confirm the newest deployment appears:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages deployment list --project-name vergefive
```

## R2 video hosting

The deployed HTML video tags currently point to Cloudflare's managed public R2 URL:

`https://pub-15820b1cee7544748132a3028ca4c32a.r2.dev/<encoded-file-name>.mp4`

This avoids waiting on `videos.vergefive.com` while the main `vergefive.com` DNS zone is still outside Cloudflare. After the domain is active in Cloudflare, the HTML can be switched from the `r2.dev` hostname to `https://videos.vergefive.com`.

Expected video object keys:

- `0hVmoTqDQJukNW0ODtgD_Biz website-v.mp4`
- `1Ulk1qYvR3lh5j8aLnT7_Biz Plan-v.mp4`
- `48Y85a3RLKqClFkgslVg_Biz Phone-v.mp4`
- `BvtcnbWOSLaD9IeR40Xy_ebook Nav _ecred-1-v.mp4`
- `Dm2qruAgQLOX19aoq71g_ebook  net 30-v.mp4`
- `fnZohfZQQFWMhH6Ufso5_Biz EIN-v.mp4`
- `I5Xq7kk1SOqgtEoNeStr_Biz bank acct-v.mp4`
- `LiAShjxGRy2IefFnUSSJ_Biz 411-v.mp4`
- `QjjmlLftSTqWxopXVBnN_Biz Address-v.mp4`
- `sSBDBFTw2ce0IDjrPt1g_Understanding Business Credit Cards_ Typ 2023-11-19-v.mp4`

Upload or replace a single video:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' wrangler r2 object put "vergefive-videos/<object key>.mp4" --file "D:\path\to\local-video.mp4" --content-type video/mp4
```

Bulk upload from a local `videos/` folder:

```powershell
$bucket = 'vergefive-videos'
Get-ChildItem .\videos -Filter *.mp4 | ForEach-Object {
  & 'C:\Program Files\nodejs\npx.cmd' wrangler r2 object put "$bucket/$($_.Name)" --file $_.FullName --content-type video/mp4
}
```

Connect the custom R2 video hostname after the `vergefive.com` zone is active:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' wrangler r2 bucket domain add vergefive-videos --domain videos.vergefive.com --zone-id <VERGEFIVE_ZONE_ID> --min-tls 1.2 --force
& 'C:\Program Files\nodejs\npx.cmd' wrangler r2 bucket domain list vergefive-videos
```

If a video is loaded by JavaScript/fetch in the future, configure R2 CORS to allow `https://vergefive.com`, `https://www.vergefive.com`, and `https://vergefive.pages.dev`. The current build uses plain `<video><source src="...">` embeds.

Managed public URL status:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' wrangler r2 bucket dev-url get vergefive-videos
```

## Custom domains

Custom domains are managed on the Cloudflare Pages project.

Dashboard path:

1. Cloudflare Dashboard -> Workers & Pages
2. Select `vergefive`
3. Open Custom domains
4. Add or verify `vergefive.com` and `www.vergefive.com`

API path used during finalization:

```http
POST /client/v4/accounts/7e010843ac0f3d614b1b553011f47784/pages/projects/vergefive/domains
{ "name": "vergefive.com" }

POST /client/v4/accounts/7e010843ac0f3d614b1b553011f47784/pages/projects/vergefive/domains
{ "name": "www.vergefive.com" }
```

The Pages custom domains were added and were `pending` while the `vergefive.com` zone was still pending.

## DNS notes

For the apex domain, Cloudflare Pages expects the domain to be an active Cloudflare zone. For `www`, Cloudflare can create or use a CNAME pointing to the Pages project once the custom domain is associated.

Do not rely on manually pointing DNS at `vergefive.pages.dev` without associating the domain to the Pages project first; Cloudflare documents that this can fail with a 522.

## Production verification checklist

After videos are uploaded and the custom domains are active, verify:

- `https://vergefive.com/`
- `https://www.vergefive.com/`
- `https://vergefive.com/sitemap.xml`
- `https://vergefive.com/robots.txt`
- `https://vergefive.com/llms.txt`
- `https://vergefive.com/manifest.json`
- All 10 `https://pub-15820b1cee7544748132a3028ca4c32a.r2.dev/*.mp4` URLs return `Content-Type: video/mp4`, not `text/html`.
- Step 4 remains locked until all 12 readiness criteria are checked on `/homeefe757a6/`.
- Step 5/vendor pages remain reachable only through the intended member flow.
- ElevenLabs ConvAI agent `P4GQIupYxvfwMhay6t2U` loads and responds.
- JSON-LD validates on homepage, pricing/home page, and one Step page.
- Open Graph/Twitter Card previews render correctly.
- Desktop and mobile pass without console errors or broken embeds.

## Secrets and environment variables

Wrangler authentication lives in the local user Wrangler config and must not be committed.

### Membership backend

The membership backend uses Cloudflare Pages Functions, Cloudflare D1, and Stripe.

Required Pages bindings:

- `DB`: Cloudflare D1 database binding for member accounts and progress.

Required environment variables/secrets:

- `SITE_URL`: production site origin, for example `https://www.vergefive.com`.
- `STRIPE_SECRET_KEY`: Stripe secret key.
- `STRIPE_PRICE_ID`: Stripe recurring monthly Price ID for Verge Five membership. Kept as the monthly fallback.
- `STRIPE_PRICE_ID_MONTHLY`: Optional explicit Stripe monthly Price ID. If omitted, `STRIPE_PRICE_ID` is used.
- `STRIPE_PRICE_ID_ANNUAL`: Stripe recurring annual Price ID for the $497/year membership option.
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret.
- `ADMIN_EMAILS`: comma-separated owner/admin email addresses allowed to access `/admin/`.
- `TURNSTILE_SITE_KEY`: Cloudflare Turnstile public site key for signup/login widgets.
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret key used by Pages Functions to verify signup/login tokens.
- `RESEND_API_KEY`: optional Resend API key for verification emails.
- `EMAIL_FROM`: optional verified sender, for example `Verge Five <support@vergefive.com>`.
- `REQUIRE_EMAIL_VERIFICATION`: set to `true` only after email delivery is configured and tested.
- `PASSWORD_RESET_DEBUG_LINKS`: optional QA-only flag. Set to `true` only in a private preview if reset links must be shown in-browser while email delivery is not configured.

Create the D1 database:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' wrangler d1 create vergefive-members
```

Copy `wrangler.example.toml` to `wrangler.toml`, replace `REPLACE_WITH_D1_DATABASE_ID`, or add the same D1 binding in the Cloudflare Pages dashboard.

Apply the schema:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' wrangler d1 execute vergefive-members --file .\schema\member-progress.sql
```

Set Stripe secrets on the Pages project:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages secret put STRIPE_SECRET_KEY --project-name vergefive
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages secret put STRIPE_PRICE_ID --project-name vergefive
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages secret put STRIPE_PRICE_ID_ANNUAL --project-name vergefive
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name vergefive
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages secret put SITE_URL --project-name vergefive
```

Set security and admin secrets:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages secret put ADMIN_EMAILS --project-name vergefive
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages secret put TURNSTILE_SITE_KEY --project-name vergefive
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages secret put TURNSTILE_SECRET_KEY --project-name vergefive
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages secret put RESEND_API_KEY --project-name vergefive
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages secret put EMAIL_FROM --project-name vergefive
& 'C:\Program Files\nodejs\npx.cmd' wrangler pages secret put REQUIRE_EMAIL_VERIFICATION --project-name vergefive
```

Turnstile setup:

1. Cloudflare Dashboard -> Turnstile -> Add widget.
2. Add `vergefive.com`, `www.vergefive.com`, and `vergefive.pages.dev` as allowed hostnames.
3. Store the site key as `TURNSTILE_SITE_KEY`.
4. Store the secret key as `TURNSTILE_SECRET_KEY`.

Email verification setup:

1. Verify the sending domain or sender in Resend.
2. Store the API key as `RESEND_API_KEY`.
3. Store the verified sender as `EMAIL_FROM`.
4. Test signup while `REQUIRE_EMAIL_VERIFICATION` is unset or `false`.
5. After messages deliver correctly, set `REQUIRE_EMAIL_VERIFICATION` to `true`.

If `RESEND_API_KEY` and `EMAIL_FROM` are not configured, the signup API returns a temporary verification link for QA. Do not rely on that behavior for production access.

Stripe webhook endpoint:

```text
https://www.vergefive.com/api/billing/webhook
```

Subscribe the webhook to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Membership routes added:

- `/signup/`
- `/login/`
- `/membership/`
- `/account/`
- `/admin/`
- `/verify-email/`
- `/forgot-password/`
- `/reset-password/`
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/me`
- `/api/auth/verify-email`
- `/api/auth/resend-verification`
- `/api/auth/request-password-reset`
- `/api/auth/reset-password`
- `/api/config`
- `/api/admin/members`
- `/api/admin/affiliates`
- `/api/billing/create-checkout-session`
- `/api/billing/create-portal-session`
- `/api/billing/webhook`
- `/api/member/profile`
- `/api/member/progress`
- `/api/member/reports`

## Affiliate system

The affiliate MVP is built into the member backend and admin area.

Affiliate link format:

```text
https://www.vergefive.com/?ref=<affiliate-code>
```

Commission rules:

- Annual membership: `$60` commission for a paid annual signup.
- Monthly membership: `$60` commission only after the member has made `3` successful monthly payments.
- Payouts are manual from the admin queue. Use `/admin/` to mark payable commissions as paid after the affiliate has been paid outside the platform.

Webhook event requirements:

In addition to the membership events, the Stripe webhook should include:

- `invoice.paid`

This event is what advances monthly affiliate commissions from `pending` to `payable` after the third successful monthly payment.


## Cloudflare status recheck - 2026-05-23

Pages custom domains for vergefive.com and www.vergefive.com currently show deactivated. The current Cloudflare token does not list a vergefive.com zone. Public DNS still uses SystemDNS nameservers and Duda-style targets, so the Pages preview URL remains the source of truth until DNS/zone activation is completed. Preview environment secrets are also incomplete; /api/config on backend-progress reports Stripe, Turnstile, and email provider readiness flags as false.
