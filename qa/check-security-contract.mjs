import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

const loginAdapter = read("app/api/auth/login/route.ts");
const scanRoute = read("app/api/scan/route.ts");
const auth = read("functions/_lib/auth.js");
const security = read("functions/_lib/security.js");
const stripe = read("functions/_lib/stripe.js");
const registration = read("functions/api/auth/register.js");
const passwordReset = read("functions/api/auth/reset-password.js");
const emailVerification = read("functions/api/auth/verify-email.js");
const adminActions = read("functions/api/admin/actions.js");
const affiliates = read("functions/_lib/affiliates.js");
const createCheckout = read("functions/api/billing/create-checkout-session.js");
const checkoutSuccess = read("functions/api/billing/checkout-success.js");
const webhook = read("functions/api/billing/webhook.js");
const reports = read("functions/api/member/reports.js");
const contact = read("functions/api/contact.js");
const schema = read("schema/member-progress.sql");

const memberHandlers = [
  "functions/api/member/profile.js",
  "functions/api/member/guide.js",
  "functions/api/member/visibility-audits.js",
  "functions/api/member/progress.js",
];

const checks = [
  [
    "App Router login delegates to the hardened canonical handler",
    loginAdapter.includes('functions/api/auth/login.js')
      && loginAdapter.includes("runCloudflareFunction"),
  ],
  [
    "public scan requires same-origin, bounded JSON, and rate limiting",
    scanRoute.includes("requireSameOrigin(requestContext)")
      && scanRoute.includes("readJson(request, 16 * 1024)")
      && scanRoute.includes("rateLimit(d1Env, `platform-scan:${ip}`"),
  ],
  [
    "rate limiting uses one atomic conditional upsert",
    auth.includes("on conflict(bucket) do update set")
      && auth.includes("returning count, reset_at"),
  ],
  [
    "central active-membership authorization exists",
    auth.includes("export async function requireActiveMember"),
  ],
  [
    "all member data handlers require active membership",
    memberHandlers.every((path) => read(path).includes("requireActiveMember(context)")),
  ],
  [
    "verification and reset tokens are hashed before storage",
    security.includes("const tokenHash = await sha256Hex(token)")
      && passwordReset.includes("const tokenHash = await sha256Hex(token)")
      && emailVerification.includes("const tokenHash = await sha256Hex(token)"),
  ],
  [
    "debug auth links require an explicit development-only flag",
    security.includes("export function allowDevelopmentDebugLink")
      && security.includes("APP_ENVIRONMENT")
      && registration.includes("allowDevelopmentDebugLink"),
  ],
  [
    "required email verification does not issue a session",
    registration.includes("verificationRequired ? '' : await createSession"),
  ],
  [
    "admin test coupons require explicit development Stripe test mode",
    stripe.includes("export function requireExplicitDevelopmentStripeTestMode")
      && adminActions.includes("requireExplicitDevelopmentStripeTestMode"),
  ],
  [
    "checkout completion is product-bound, rate-limited, and replay-protected",
    checkoutSuccess.includes("metadata.product === 'verge-five-membership'")
      && checkoutSuccess.includes("rateLimit(context.env, `checkout-success:")
      && checkoutSuccess.includes("checkout_access_events")
      && checkoutSuccess.includes("existing.status === 'completed'")
      && checkoutSuccess.includes("/line_items")
      && checkoutSuccess.includes("actualPriceId === expectedPriceId"),
  ],
  [
    "webhook processing is retryable and product-bound",
    webhook.includes("VERGE_FIVE_PRODUCT")
      && webhook.includes("status === 'completed'")
      && webhook.includes("failEvent")
      && webhook.includes("last_error")
      && webhook.includes("stripeEventModeAllowed")
      && webhook.includes("event.livemode === false")
      && webhook.includes("/line_items")
      && webhook.includes("isConfiguredPlanPrice"),
  ],
  [
    "server checkout metadata and membership state bind to the configured Stripe price",
    createCheckout.includes("price_id: priceId")
      && checkoutSuccess.includes("stripe_price_id")
      && webhook.includes("stripe_price_id"),
  ],
  [
    "affiliate invoice recording and commission increment are atomic",
    affiliates.includes("env.DB.batch([")
      && affiliates.includes("qualifying_payments_count = qualifying_payments_count + 1")
      && affiliates.includes("throw error"),
  ],
  [
    "upgrade-only reports require paid membership",
    auth.includes("export async function requirePaidMember")
      && reports.includes("requirePaidMember(context)"),
  ],
  [
    "admin progress reset clears normalized fix state",
    adminActions.includes("delete from member_fix_status where user_id = ?")
      && adminActions.includes("'member_fix_status'"),
  ],
  [
    "contact success depends on durable D1 support persistence",
    contact.includes("insert into support_requests")
      && contact.includes("if (!storedId)"),
  ],
  [
    "fresh D1 schema includes retryable billing event tables",
    schema.includes("create table if not exists stripe_webhook_events")
      && schema.includes("status text not null default 'processing'")
      && schema.includes("create table if not exists checkout_access_events"),
  ],
];

const failed = checks.filter(([, passed]) => !passed);
if (failed.length) {
  console.error(failed.map(([name]) => `- ${name}`).join("\n"));
  process.exit(1);
}

console.log("PASS: migration security contract protects auth, member data, public scan, billing retries, and dev-only test actions.");
