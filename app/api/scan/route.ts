import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateScanResult } from "@/lib/scan-generator";

function required(value: unknown) {
  return String(value ?? "").trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = {
      name: required(body.name),
      entityType: required(body.entityType),
      address: required(body.address),
      phone: required(body.phone),
      website: required(body.website),
      email: required(body.email).toLowerCase(),
    };

    for (const [key, value] of Object.entries(input)) {
      if (!value) return NextResponse.json({ ok: false, error: `Missing ${key}.` }, { status: 400 });
    }

    const session = await auth();
    let userId = session?.user?.id;

    if (!userId) {
      const guestEmail = `scan-${crypto.randomUUID()}@guest.vergefive.local`;
      const guest = await prisma.user.create({
        data: {
          email: guestEmail,
          name: input.name,
          passwordHash: await hash(crypto.randomUUID(), 12),
          entitlement: "free",
        },
        select: { id: true },
      });
      userId = guest.id;
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { entitlement: true } });
    const generated = generateScanResult(input);
    const business = await prisma.business.create({
      data: {
        userId,
        name: input.name,
        entityType: input.entityType,
        address: input.address,
        phone: input.phone,
        website: input.website,
        email: input.email,
        scans: {
          create: {
            readinessScore: generated.readinessScore,
            grade: generated.grade,
            signalsTotal: generated.signalsTotal,
            signalsClean: generated.signalsClean,
            issues: {
              create: generated.issues.map(({ potentialPoints: _potentialPoints, ...issue }) => issue),
            },
            accountMatches: {
              create: generated.accountMatches,
            },
          },
        },
      },
      include: { scans: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    const scan = business.scans[0];
    const response = NextResponse.json({ ok: true, scanId: scan.id, redirectTo: user?.entitlement && user.entitlement !== "free" ? "/dashboard/" : "/scan/results" });
    response.cookies.set("vf_latest_scan_id", scan.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    response.cookies.set("vf_light_user_id", userId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch (error) {
    console.error("scan failed", error);
    return NextResponse.json({ ok: false, error: "The scan could not run right now." }, { status: 500 });
  }
}
