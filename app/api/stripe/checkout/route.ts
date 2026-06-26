import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { appUrl, checkoutLineItems, normalizeBilling, normalizePlan, stripeClient } from "@/lib/stripe";

const OPEN_CHECKOUT_WINDOW_SECONDS = 45 * 60;

async function findOpenCheckoutSessionUrl(stripe: Stripe, userId: string, customerId: string, plan: string, billing: string) {
  const sessions = await stripe.checkout.sessions.list({ customer: customerId, limit: 10 });
  const now = Math.floor(Date.now() / 1000);
  for (let index = 0; index < sessions.data.length; index += 1) {
    const session = sessions.data[index];
    if (session.status !== "open") continue;
    if (session.client_reference_id !== userId) continue;
    const sessionPlan = normalizePlan(session.metadata?.plan);
    const sessionBilling = normalizeBilling(session.metadata?.billing);
    if (sessionPlan !== plan || sessionBilling !== billing) continue;
    if (!session.created || now - session.created > OPEN_CHECKOUT_WINDOW_SECONDS) continue;
    if (!session.url) continue;
    return session.url;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Please sign up or log in before checkout." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const plan = normalizePlan(body.plan);
    const billing = normalizeBilling(body.billing);
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });

    const stripe = stripeClient();
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }
    const existingCheckoutUrl = await findOpenCheckoutSessionUrl(stripe, user.id, customerId, plan, billing);
    if (existingCheckoutUrl) return NextResponse.json({ ok: true, url: existingCheckoutUrl });

    const idempotencyKey = `new-checkout:${user.id}:${plan}:${billing}`;
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: checkoutLineItems(plan, billing),
      allow_promotion_codes: true,
      success_url: `${appUrl()}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/signup?plan=${plan}&billing=${billing}&canceled=1`,
      metadata: { userId: user.id, plan, billing },
      subscription_data: { metadata: { userId: user.id, plan, billing } },
    }, {
      idempotencyKey
    });

    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (error) {
    console.error("checkout failed", error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Checkout could not start." }, { status: 500 });
  }
}
