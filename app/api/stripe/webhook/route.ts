import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    ignored: true,
    reason: "Stripe webhooks are handled by the canonical Cloudflare billing endpoint.",
    canonicalEndpoint: "/api/billing/webhook",
  });
}
