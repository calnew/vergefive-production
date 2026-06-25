import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { appUrl, stripeClient } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Please log in first." }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || (user.entitlement !== "self_serve" && user.entitlement !== "done_with_you")) {
      return NextResponse.json({ ok: false, error: "Upgrade required to manage platform billing." }, { status: 403 });
    }
    if (!user.stripeCustomerId) return NextResponse.json({ ok: false, error: "No billing customer exists yet." }, { status: 400 });

    const stripe = stripeClient();
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl()}/account/settings`,
    });

    return NextResponse.json({ ok: true, url: portal.url });
  } catch (error) {
    console.error("portal failed", error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Portal could not open." }, { status: 500 });
  }
}
