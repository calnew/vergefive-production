import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getAuth } from "@/functions/_lib/auth.js";
import type { D1Env } from "@/lib/d1-auth";
import { generateScanResult } from "@/lib/scan-generator";

function required(value: unknown) {
  return String(value ?? "").trim();
}

async function ensureScanTables(env: D1Env) {
  await env.DB.prepare(
    `create table if not exists business_profiles (
      user_id text primary key references users(id) on delete cascade,
      business_name text,
      trade_name text,
      entity_type text,
      formation_state text,
      ein text,
      industry text,
      phone text,
      address text,
      website text,
      email text,
      bank integer not null default 0,
      directory_411 integer not null default 0,
      bureau_profile integer not null default 0,
      vendor_tradelines integer not null default 0,
      funding_reserve integer not null default 0,
      updated_at text not null default (datetime('now'))
    )`
  ).run();
  await env.DB.prepare(
    `create table if not exists visibility_audits (
      id text primary key,
      user_id text not null references users(id) on delete cascade,
      mode text not null,
      business_name text,
      score integer,
      label text,
      source_mode text,
      engine text,
      result_json text not null,
      created_at text not null default (datetime('now'))
    )`
  ).run();
  await env.DB.prepare("create index if not exists idx_visibility_audits_user on visibility_audits(user_id, mode, created_at)").run();
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

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const d1Env = env as D1Env;
    if (!d1Env.DB) return NextResponse.json({ ok: false, error: "D1 binding DB is not configured." }, { status: 500 });

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

    await ensureScanTables(d1Env);

    const auth = await getAuth(request, d1Env);
    const userId = auth?.user?.id || await createGuestScanUser(d1Env, input.name);
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Could not create a scan user." }, { status: 500 });
    }

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
    response.cookies.set("vf_latest_scan_id", auditId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    response.cookies.set("vf_light_user_id", userId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch (error) {
    console.error("scan failed", error);
    return NextResponse.json({ ok: false, error: "The scan could not run right now." }, { status: 500 });
  }
}
