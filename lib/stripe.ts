import Stripe from "stripe";

export type CheckoutPlan = "self-serve" | "done-with-you";
export type BillingPeriod = "yearly" | "monthly";

export function appUrl() {
  return process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010";
}

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return new Stripe(key, { apiVersion: "2026-02-25.clover" as never });
}

export function normalizePlan(plan?: string | null): CheckoutPlan {
  return plan === "done-with-you" || plan === "done_with_you" ? "done-with-you" : "self-serve";
}

export function normalizeBilling(billing?: string | null): BillingPeriod {
  return billing === "monthly" ? "monthly" : "yearly";
}

export function entitlementForPlan(plan: CheckoutPlan) {
  return plan === "done-with-you" ? "done_with_you" : "self_serve";
}

export function checkoutLineItems(plan: CheckoutPlan, billing: BillingPeriod) {
  const selfServePrice = billing === "monthly" ? process.env.STRIPE_PRICE_SELF_SERVE_MONTHLY : process.env.STRIPE_PRICE_SELF_SERVE_YEARLY;
  const doneWithYouPrice = process.env.STRIPE_PRICE_DONE_WITH_YOU;

  if (!selfServePrice) {
    throw new Error(`Missing ${billing === "monthly" ? "STRIPE_PRICE_SELF_SERVE_MONTHLY" : "STRIPE_PRICE_SELF_SERVE_YEARLY"}.`);
  }

  if (plan === "done-with-you" && !doneWithYouPrice) {
    throw new Error("Missing STRIPE_PRICE_DONE_WITH_YOU.");
  }

  const items = [{ price: selfServePrice, quantity: 1 }];
  if (plan === "done-with-you") items.push({ price: doneWithYouPrice!, quantity: 1 });
  return items;
}