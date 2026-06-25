import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { entitlementForPlan, normalizePlan, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

async function updateUserFromCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.client_reference_id || undefined;
  const customerId = typeof session.customer === "string" ? session.customer : undefined;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : undefined;
  const plan = normalizePlan(session.metadata?.plan);

  if (!userId && !customerId) return;

  await prisma.user.updateMany({
    where: userId ? { id: userId } : { stripeCustomerId: customerId },
    data: {
      entitlement: entitlementForPlan(plan),
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    },
  });
}

async function updateUserFromSubscription(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : undefined;
  if (!customerId) return;

  if (["canceled", "unpaid", "incomplete_expired"].includes(subscription.status)) {
    await prisma.user.updateMany({ where: { stripeCustomerId: customerId }, data: { entitlement: "free" } });
    return;
  }

  if (["active", "trialing"].includes(subscription.status)) {
    const plan = normalizePlan(subscription.metadata?.plan);
    await prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: { entitlement: entitlementForPlan(plan), stripeSubscriptionId: subscription.id },
    });
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ ok: false, error: "STRIPE_WEBHOOK_SECRET is not configured." }, { status: 500 });

  const stripe = stripeClient();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ ok: false, error: "Missing Stripe signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Invalid webhook signature." }, { status: 400 });
  }

  const existing = await prisma.stripeEvent.findUnique({ where: { id: event.id } });
  if (existing) return NextResponse.json({ ok: true, duplicate: true });

  try {
    if (event.type === "checkout.session.completed") {
      await updateUserFromCheckout(event.data.object as Stripe.Checkout.Session);
    }

    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      await updateUserFromSubscription(event.data.object as Stripe.Subscription);
    }

    await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("stripe webhook processing failed", error);
    return NextResponse.json({ ok: false, error: "Webhook processing failed." }, { status: 500 });
  }
}