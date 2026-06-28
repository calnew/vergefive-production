import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Checkout is handled by the canonical Cloudflare billing endpoint at /api/billing/create-checkout-session.",
      canonicalEndpoint: "/api/billing/create-checkout-session",
    },
    { status: 410 },
  );
}
