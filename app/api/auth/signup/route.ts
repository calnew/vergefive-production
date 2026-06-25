import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ ok: false, error: "Enter your name." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ ok: false, error: "Use at least 8 characters for your password." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "An account already exists for that email." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: await hash(password, 12),
      },
      select: {
        id: true,
        email: true,
        name: true,
        entitlement: true,
      },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    console.error("signup failed", error);
    return NextResponse.json({ ok: false, error: "Could not create your account right now." }, { status: 500 });
  }
}