import { recordPaidInvoice } from "../functions/_lib/affiliates.js";
import { requirePaidMember } from "../functions/_lib/auth.js";
import { onRequestPost as handleWebhook } from "../functions/api/billing/webhook.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function signedStripeRequest(event, secret) {
  const body = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${body}`),
  );
  return new Request("https://vergefive-next-dev.turncomvoice.workers.dev/api/billing/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": `t=${timestamp},v1=${bytesToHex(signature)}`,
    },
    body,
  });
}

function affiliateDb(batchError = null) {
  const state = { batch: null };
  return {
    state,
    prepare(sql) {
      return {
        bind(...bindings) {
          return {
            sql,
            bindings,
            async first() {
              return sql.includes("select id from affiliate_commissions") ? { id: "commission-1" } : null;
            },
          };
        },
      };
    },
    async batch(statements) {
      state.batch = statements;
      if (batchError) throw batchError;
      return statements.map(() => ({ success: true }));
    },
  };
}

function subscriptionDb(membership = null) {
  const state = { runs: [] };
  return {
    state,
    prepare(sql) {
      return {
        bind(...bindings) {
          return {
            sql,
            bindings,
            async first() {
              if (sql.includes("from stripe_webhook_events")) return null;
              if (sql.includes("from memberships where stripe_subscription_id")) {
                return membership;
              }
              return null;
            },
            async run() {
              state.runs.push({ sql, bindings });
              return { success: true };
            },
          };
        },
      };
    },
  };
}

const webhookSecret = "whsec_behavior_test";
let dbTouches = 0;
const rejectingDb = {
  prepare() {
    dbTouches += 1;
    throw new Error("Dev/live mode rejection must happen before D1.");
  },
};
const liveRequest = await signedStripeRequest({
  id: "evt_live_rejected",
  type: "checkout.session.completed",
  livemode: true,
  data: { object: {} },
}, webhookSecret);
const liveResponse = await handleWebhook({
  request: liveRequest,
  env: {
    DB: rejectingDb,
    APP_ENVIRONMENT: "development",
    STRIPE_MODE_REQUIRED: "test",
    STRIPE_WEBHOOK_SECRET: webhookSecret,
  },
});
assert(liveResponse.status === 403, `Expected live dev webhook rejection, received ${liveResponse.status}.`);
assert(dbTouches === 0, "Rejected live dev webhook touched D1.");

const trialGuard = await requirePaidMember({
  request: new Request("https://example.test/api/member/reports"),
  data: {
    auth: {
      user: { id: "trial-user", email: "trial@example.test" },
      membership: { status: "trial" },
      active: true,
    },
  },
  env: { ADMIN_EMAILS: "" },
});
assert(trialGuard.response?.status === 402, "Trial member was not blocked from the paid report capability.");

const paidGuard = await requirePaidMember({
  request: new Request("https://example.test/api/member/reports"),
  data: {
    auth: {
      user: { id: "paid-user", email: "paid@example.test" },
      membership: { status: "active" },
      active: true,
    },
  },
  env: { ADMIN_EMAILS: "" },
});
assert(!paidGuard.response && paidGuard.auth?.user?.id === "paid-user", "Paid member was blocked from reports.");

const successDb = affiliateDb();
await recordPaidInvoice({ DB: successDb }, { id: "in_success", subscription: "sub_success" });
assert(successDb.state.batch?.length === 2, "Affiliate invoice processing was not submitted as one two-statement batch.");
assert(
  successDb.state.batch[1].sql.includes("qualifying_payments_count = qualifying_payments_count + 1"),
  "Affiliate batch does not increment the commission atomically.",
);

const retryDb = affiliateDb(new Error("D1 write unavailable"));
let retryError = null;
try {
  await recordPaidInvoice({ DB: retryDb }, { id: "in_retry", subscription: "sub_retry" });
} catch (error) {
  retryError = error;
}
assert(retryError?.message === "D1 write unavailable", "Non-duplicate affiliate failure was swallowed instead of remaining retryable.");

const duplicateDb = affiliateDb(new Error("UNIQUE constraint failed: affiliate_invoice_events.stripe_invoice_id"));
await recordPaidInvoice({ DB: duplicateDb }, { id: "in_duplicate", subscription: "sub_duplicate" });

const retiredDb = subscriptionDb({
  user_id: "paid-user",
  plan: "monthly",
  stripe_price_id: "price_retired",
});
const retiredRequest = await signedStripeRequest({
  id: "evt_retired_price_cancel",
  type: "customer.subscription.deleted",
  livemode: false,
  data: {
    object: {
      id: "sub_retired",
      status: "canceled",
      customer: "",
      current_period_end: 0,
      metadata: {
        user_id: "wrong-user",
        product: "verge-five-membership",
        product_plan: "self-serve",
        plan: "annual",
        price_id: "price_retired",
      },
      items: { data: [{ price: { id: "price_retired" } }] },
    },
  },
}, webhookSecret);
const retiredResponse = await handleWebhook({
  request: retiredRequest,
  env: {
    DB: retiredDb,
    APP_ENVIRONMENT: "development",
    STRIPE_MODE_REQUIRED: "test",
    STRIPE_WEBHOOK_SECRET: webhookSecret,
    STRIPE_PRICE_ID_MONTHLY: "price_current",
    STRIPE_PRICE_ID_ANNUAL: "price_annual",
  },
});
assert(retiredResponse.status === 200, `Retired-price cancellation returned ${retiredResponse.status}.`);
const retiredMembershipWrite = retiredDb.state.runs.find((entry) => entry.sql.includes("insert into memberships"));
assert(retiredMembershipWrite, "Retired-price cancellation did not update membership state.");
assert(retiredMembershipWrite.bindings.includes("canceled"), "Retired-price cancellation did not persist canceled status.");
assert(retiredMembershipWrite.bindings.includes("price_retired"), "Retired-price cancellation did not preserve the stored historical price.");
assert(retiredMembershipWrite.bindings.includes("paid-user"), "Persisted subscription ownership was not authoritative.");
assert(retiredMembershipWrite.bindings.includes("monthly"), "Persisted subscription plan was not authoritative.");
assert(!retiredMembershipWrite.bindings.includes("wrong-user"), "Mutable Stripe metadata overrode persisted subscription ownership.");
assert(!retiredMembershipWrite.bindings.includes("annual"), "Mutable Stripe metadata overrode the persisted subscription plan.");

const legacyDb = subscriptionDb({
  user_id: "legacy-user",
  plan: "monthly",
  stripe_price_id: null,
});
const legacyRequest = await signedStripeRequest({
  id: "evt_legacy_retired_price_cancel",
  type: "customer.subscription.deleted",
  livemode: false,
  data: {
    object: {
      id: "sub_legacy_retired",
      status: "canceled",
      customer: "",
      current_period_end: 0,
      metadata: {},
      items: { data: [{ price: { id: "price_legacy_retired" } }] },
    },
  },
}, webhookSecret);
const legacyResponse = await handleWebhook({
  request: legacyRequest,
  env: {
    DB: legacyDb,
    APP_ENVIRONMENT: "development",
    STRIPE_MODE_REQUIRED: "test",
    STRIPE_WEBHOOK_SECRET: webhookSecret,
    STRIPE_PRICE_ID_MONTHLY: "price_current",
    STRIPE_PRICE_ID_ANNUAL: "price_annual",
  },
});
assert(legacyResponse.status === 200, `Legacy retired-price cancellation returned ${legacyResponse.status}.`);
const legacyMembershipWrite = legacyDb.state.runs.find((entry) => entry.sql.includes("insert into memberships"));
assert(legacyMembershipWrite, "Legacy subscription without a stored price was not updated.");
assert(legacyMembershipWrite.bindings.includes("legacy-user"), "Legacy subscription ownership was not preserved.");
assert(legacyMembershipWrite.bindings.includes("price_legacy_retired"), "Legacy historical price was not backfilled.");
assert(legacyMembershipWrite.bindings.includes("canceled"), "Legacy cancellation status was not persisted.");

const unboundDb = subscriptionDb();
const unboundRequest = await signedStripeRequest({
  id: "evt_unbound_retired_price",
  type: "customer.subscription.updated",
  livemode: false,
  data: {
    object: {
      id: "sub_unbound_retired",
      status: "active",
      customer: "",
      current_period_end: 0,
      metadata: {
        user_id: "unbound-user",
        product: "verge-five-membership",
        product_plan: "self-serve",
        plan: "monthly",
        price_id: "price_retired",
      },
      items: { data: [{ price: { id: "price_retired" } }] },
    },
  },
}, webhookSecret);
const unboundResponse = await handleWebhook({
  request: unboundRequest,
  env: {
    DB: unboundDb,
    APP_ENVIRONMENT: "development",
    STRIPE_MODE_REQUIRED: "test",
    STRIPE_WEBHOOK_SECRET: webhookSecret,
    STRIPE_PRICE_ID_MONTHLY: "price_current",
    STRIPE_PRICE_ID_ANNUAL: "price_annual",
  },
});
assert(unboundResponse.status === 200, `Unbound retired-price event returned ${unboundResponse.status}.`);
assert(
  !unboundDb.state.runs.some((entry) => entry.sql.includes("insert into memberships")),
  "An unbound subscription on a retired price mutated membership state.",
);

console.log("PASS: live dev webhooks fail before D1, paid-report policy is enforced, affiliate invoice updates stay retryable, and persisted subscription bindings remain authoritative across price rotations.");
