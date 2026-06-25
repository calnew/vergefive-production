import { cleanLimited, getAuth, json, readJson, requireSameOrigin } from '../../_lib/auth.js';

async function ensureTable(env) {
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
  await env.DB.prepare('create index if not exists idx_visibility_audits_user on visibility_audits(user_id, mode, created_at)').run();
}

export async function onRequestGet(context) {
  const auth = context.data.auth || await getAuth(context.request, context.env);
  if (!auth) return json({ error: 'Login required.' }, 401);
  await ensureTable(context.env);
  const rows = await context.env.DB.prepare(
    `select id, mode, business_name, score, label, source_mode, engine, result_json, created_at
     from visibility_audits
     where user_id = ?
     order by created_at desc
     limit 20`
  ).bind(auth.user.id).all();
  return json({ audits: rows.results || [] });
}

export async function onRequestPost(context) {
  const originError = requireSameOrigin(context);
  if (originError) return originError;
  const auth = context.data.auth || await getAuth(context.request, context.env);
  if (!auth) return json({ error: 'Login required.' }, 401);
  const input = await readJson(context.request, 40 * 1024);
  const mode = cleanLimited(input.mode, 20) === 'after' ? 'after' : 'before';
  const result = input.result && typeof input.result === 'object' ? input.result : {};
  const summary = {
    score: Number(result.score || 0),
    label: cleanLimited(result.label, 120),
    sourceMode: cleanLimited(result.sourceMode, 80),
    engine: cleanLimited(result.engine, 120),
    findings: Array.isArray(result.findings) ? result.findings.map((item) => cleanLimited(item, 300)).slice(0, 8) : [],
    redFlags: Array.isArray(result.redFlags) ? result.redFlags.map((item) => cleanLimited(item, 300)).slice(0, 8) : [],
    signals: result.signals && typeof result.signals === 'object' ? {
      state: !!result.signals.state,
      website: !!result.signals.website,
      phone: !!result.signals.phone,
      address: !!result.signals.address,
      email: !!result.signals.email,
      directory: !!result.signals.directory,
      entity: !!result.signals.entity
    } : {},
    evidence: Array.isArray(result.evidence) ? result.evidence.slice(0, 6).map((item) => ({
      title: cleanLimited(item.title, 180),
      url: cleanLimited(item.url, 300),
      domain: cleanLimited(item.domain, 120)
    })) : [],
    providerConfigured: !!result.providerConfigured,
    fallbackReason: cleanLimited(result.fallbackReason, 300),
    aiStatus: cleanLimited(result.aiStatus, 80),
    aiRecommendation: cleanLimited(result.aiRecommendation, 600),
    businessName: cleanLimited(result.businessName, 160),
    legalBusinessName: cleanLimited(result.legalBusinessName, 160),
    state: cleanLimited(result.state, 80),
    website: cleanLimited(result.website, 180),
    phone: cleanLimited(result.phone, 60),
    address: cleanLimited(result.address, 220),
    domainEmail: cleanLimited(result.domainEmail, 180),
    queries: Array.isArray(result.queries) ? result.queries.map((item) => cleanLimited(item, 220)).slice(0, 8) : [],
    disclaimer: cleanLimited(result.disclaimer, 400),
    generatedAt: cleanLimited(result.generatedAt, 80)
  };
  await ensureTable(context.env);
  await context.env.DB.prepare(
    `insert into visibility_audits
      (id, user_id, mode, business_name, score, label, source_mode, engine, result_json, created_at)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))`
  ).bind(
    crypto.randomUUID(),
    auth.user.id,
    mode,
    cleanLimited(input.businessName || result.businessName, 160),
    summary.score,
    summary.label,
    summary.sourceMode,
    summary.engine,
    JSON.stringify(summary)
  ).run();
  return json({ ok: true });
}
