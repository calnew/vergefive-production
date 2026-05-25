import { cleanLimited, getAuth, json, readJson, requireSameOrigin } from '../../_lib/auth.js';

export async function onRequestGet(context) {
  const auth = context.data.auth || await getAuth(context.request, context.env);
  if (!auth) return json({ error: 'Login required.' }, 401);
  const rows = await context.env.DB.prepare(
    `select id, report_type, readiness_stage, summary_json, created_at
     from report_snapshots
     where user_id = ?
     order by created_at desc
     limit 20`
  ).bind(auth.user.id).all();
  const reports = (rows.results || []).map((row) => ({
    id: row.id,
    reportType: row.report_type,
    readinessStage: row.readiness_stage,
    createdAt: row.created_at,
    summary: parseSummary(row.summary_json)
  }));
  return json({ reports });
}

export async function onRequestPost(context) {
  const originError = requireSameOrigin(context);
  if (originError) return originError;
  const auth = context.data.auth || await getAuth(context.request, context.env);
  if (!auth) return json({ error: 'Login required.' }, 401);
  const input = await readJson(context.request, 40 * 1024);
  const id = crypto.randomUUID();
  const summary = input.summary && typeof input.summary === 'object' ? input.summary : {};
  await context.env.DB.prepare(
    `insert into report_snapshots (id, user_id, report_type, readiness_stage, summary_json, created_at)
     values (?, ?, ?, ?, ?, datetime("now"))`
  ).bind(
    id,
    auth.user.id,
    cleanLimited(input.reportType || 'progress', 80),
    cleanLimited(input.readinessStage || '', 120),
    JSON.stringify(summary).slice(0, 30000)
  ).run();
  return json({ ok: true, id });
}

function parseSummary(value) {
  try {
    return value ? JSON.parse(value) : {};
  } catch (error) {
    return {};
  }
}