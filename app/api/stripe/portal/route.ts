import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Customer portal is handled by the canonical Cloudflare billing endpoint at /api/billing/create-portal-session.",
      canonicalEndpoint: "/api/billing/create-portal-session",
    },
    { status: 410 },
  );
}
