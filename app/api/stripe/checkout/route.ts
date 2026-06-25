import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { appUrl, checkoutLineItems, normalizeBilling, normalizePlan, stripeClient } from "@/lib/stripe";

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
    });

    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (error) {
    console.error("checkout failed", error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Checkout could not start." }, { status: 500 });
  }
}