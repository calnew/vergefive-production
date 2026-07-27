import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { cleanLimited, getAuth, getCookie, rateLimit, readJson, requireSameOrigin } from "@/functions/_lib/auth.js";
import type { D1Env } from "@/lib/d1-auth";
import { generateScanResult } from "@/lib/scan-generator";

function required(value: unknown, max: number) {
  return cleanLimited(value, max);
}

async function createGuestScanUser(env: D1Env, name: string) {
  const id = crypto.randomUUID();
  const email = `scan-${id}@guest.vergefive.local`;
  await env.DB.prepare(
    `insert into users (id, email, name, auth_provider, created_at, email_verified_at)
     values (?, ?, ?, 'guest_scan', datetime("now"), datetime("now"))`
  ).bind(id, email, name).run();
  return id;
}

async function reusableGuestScanUser(env: D1Env, request: Request) {
  const guestId = getCookie(request, "vf_light_user_id");
  if (!/^[0-9a-f-]{36}$/i.test(guestId)) return "";
  const row = await env.DB.prepare(
    "select id from users where id = ? and auth_provider = 'guest_scan' limit 1",
  ).bind(guestId).first<{ id?: string }>();
  return String(row?.id || "");
}

async function cleanupExpiredGuestScans(env: D1Env) {
  await env.DB.prepare(
    `delete from users
     where id in (
       select u.id
       from users u
       where u.auth_provider = 'guest_scan'
         and u.created_at < datetime('now', '-7 days')
         and not exists (select 1 from sessions s where s.user_id = u.id)
         and not exists (select 1 from memberships m where m.user_id = u.id)
       order by u.created_at asc
       limit 20
     )`,
  ).run();
}

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const d1Env = env as D1Env;
    if (!d1Env.DB) return NextResponse.json({ ok: false, error: "D1 binding DB is not configured." }, { status: 500 });

    const requestContext = { request, env: d1Env, data: {} };
    const originError = requireSameOrigin(requestContext);
    if (originError) return originError;

    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const limited = await rateLimit(d1Env, `platform-scan:${ip}`, { limit: 10, windowSeconds: 900 });
    if (!limited.ok) return limited.response;

    let body: Record<string, unknown>;
    try {
      body = await readJson(request, 16 * 1024);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid or oversized scan request." }, { status: 400 });
    }
    const input = {
      name: required(body.name, 160),
      entityType: required(body.entityType, 80),
      address: required(body.address, 240),
      phone: required(body.phone, 60),
      website: required(body.website, 180),
      email: required(body.email, 180).toLowerCase(),
    };

    for (const [key, value] of Object.entries(input)) {
      if (!value) return NextResponse.json({ ok: false, error: `Missing ${key}.` }, { status: 400 });
    }

    const auth = await getAuth(request, d1Env);
    const reusableGuestId = auth?.user?.id ? "" : await reusableGuestScanUser(d1Env, request);
    const userId = auth?.user?.id || reusableGuestId || await createGuestScanUser(d1Env, input.name);
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Could not create a scan user." }, { status: 500 });
    }
    await cleanupExpiredGuestScans(d1Env).catch(() => null);

    const generated = generateScanResult(input);
    const auditId = crypto.randomUUID();
    const result = {
      score: generated.readinessScore,
      readinessScore: generated.readinessScore,
      label: generated.grade,
      grade: generated.grade,
      sourceMode: "platform_scan",
      engine: "verge-five-d1-scan",
      businessName: input.name,
      legalBusinessName: input.name,
      entityType: input.entityType,
      address: input.address,
      phone: input.phone,
      website: input.website,
      domainEmail: input.email,
      signalsTotal: generated.signalsTotal,
      signalsClean: generated.signalsClean,
      signals: {
        entity: !!input.entityType,
        address: !!input.address,
        phone: input.phone.replace(/\D/g, "").length >= 10,
        website: input.website.includes("."),
        email: input.email.includes("@"),
        directory: false,
        bank: false,
        bureau: false,
        vendor: false
      },
      findings: generated.issues.map((issue) => issue.detail),
      redFlags: generated.issues.filter((issue) => issue.severity === "high").map((issue) => issue.detail),
      issues: generated.issues.map(({ potentialPoints, ...issue }) => ({ ...issue, potentialPoints })),
      accountMatches: generated.accountMatches,
      disclaimer: "This is a public visibility scan, not a credit approval guarantee. Verge Five improves readiness and does not promise approvals, funding amounts, or account decisions.",
      generatedAt: new Date().toISOString()
    };

    await d1Env.DB.prepare(
      `insert into business_profiles
        (user_id, business_name, entity_type, phone, address, website, email, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, datetime("now"))
       on conflict(user_id) do update set
        business_name = excluded.business_name,
        entity_type = excluded.entity_type,
        phone = excluded.phone,
        address = excluded.address,
        website = excluded.website,
        email = excluded.email,
        updated_at = datetime("now")`
    ).bind(userId, input.name, input.entityType, input.phone, input.address, input.website, input.email).run();

    await d1Env.DB.prepare(
      `insert into visibility_audits
        (id, user_id, mode, business_name, score, label, source_mode, engine, result_json, created_at)
       values (?, ?, 'before', ?, ?, ?, 'platform_scan', 'verge-five-d1-scan', ?, datetime("now"))`
    ).bind(auditId, userId, input.name, generated.readinessScore, generated.grade, JSON.stringify(result)).run();

    const response = NextResponse.json({ ok: true, scanId: auditId, redirectTo: auth?.active ? "/dashboard/" : "/scan/results" });
    const secure = new URL(request.url).protocol === "https:";
    response.cookies.set("vf_latest_scan_id", auditId, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 60 * 24 * 30 });
    response.cookies.set("vf_light_user_id", userId, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch (error) {
    console.error("scan failed", error);
    return NextResponse.json({ ok: false, error: "The scan could not run right now." }, { status: 500 });
  }
}
