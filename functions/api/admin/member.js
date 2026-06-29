import { getAuth, isAdminUser, json, cleanLimited } from '../../_lib/auth.js';
import { ensureAdminSchema } from '../../_lib/admin.js';

function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

async function requireAdmin(context) {
  const auth = context.data.auth || await getAuth(context.request, context.env);
  return auth && await isAdminUser(auth.user.email, context.env) ? auth : null;
}

async function ensureVisibilityAuditTable(env) {
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
  const auth = await requireAdmin(context);
  if (!auth) return json({ error: 'Admin access required.' }, 403);
  await ensureAdminSchema(context.env);

  const url = new URL(context.request.url);
  const memberId = cleanLimited(url.searchParams.get('id'), 80);
  if (!memberId) return json({ error: 'Member ID is required.' }, 400);

  const member = await context.env.DB.prepare(
    `select
      u.id,
      u.email,
      u.name,
      u.created_at,
      u.last_login_at,
      u.email_verified_at,
      u.stripe_customer_id,
      coalesce(m.status, 'none') as membership_status,
      m.current_period_end,
      m.stripe_subscription_id,
      m.stripe_price_id,
      m.plan
     from users u
     left join memberships m on m.user_id = u.id
     where u.id = ?
     limit 1`
  ).bind(memberId).first();

  if (!member) return json({ error: 'Member not found.' }, 404);
  await ensureVisibilityAuditTable(context.env);

  const profile = await context.env.DB.prepare(
    `select business_name, trade_name, entity_type, formation_state, ein, industry, phone, address, website, email,
            bank, directory_411, bureau_profile, vendor_tradelines, funding_reserve, updated_at
     from business_profiles
     where user_id = ?
     limit 1`
  ).bind(memberId).first();

  const resume = await context.env.DB.prepare(
    `select page_path, page_title, breadcrumb, updated_at
     from resume_locations
     where user_id = ?
     limit 1`
  ).bind(memberId).first();

  const progressRows = await context.env.DB.prepare(
    `select page_path, completed_indexes, last_opened_at
     from lesson_progress
     where user_id = ?
     order by last_opened_at desc
     limit 50`
  ).bind(memberId).all();

  const signalRows = await context.env.DB.prepare(
    `select signal_type, selected_keys, updated_at
     from readiness_signals
     where user_id = ?
     order by updated_at desc
     limit 50`
  ).bind(memberId).all();

  const reportRows = await context.env.DB.prepare(
    `select id, report_type, readiness_stage, summary_json, created_at
     from report_snapshots
     where user_id = ?
     order by created_at desc
     limit 20`
  ).bind(memberId).all();

  const auditRows = await context.env.DB.prepare(
    `select id, mode, business_name, score, label, source_mode, engine, result_json, created_at
     from visibility_audits
     where user_id = ?
     order by created_at desc
     limit 20`
  ).bind(memberId).all();

  const noteRows = await context.env.DB.prepare(
    `select id, admin_email, note, created_at
     from admin_notes
     where user_id = ?
     order by created_at desc
     limit 25`
  ).bind(memberId).all();

  const activityRows = await context.env.DB.prepare(
    `select id, admin_email, action, details, created_at
     from admin_activity_log
     where user_id = ?
     order by created_at desc
     limit 25`
  ).bind(memberId).all();

  const readinessLock = await context.env.DB.prepare(
    `select user_id, status, reason, message, flagged_at, unlock_after, admin_unlocked_at, admin_unlocked_by, updated_at
     from member_readiness_locks
     where user_id = ?
     limit 1`
  ).bind(memberId).first();

  const accessRows = await context.env.DB.prepare(
    `select page_path, event_type, created_at
     from member_access_events
     where user_id = ?
     order by created_at desc
     limit 40`
  ).bind(memberId).all();

  const progress = (progressRows.results || []).map((row) => ({
    pagePath: row.page_path,
    completedIndexes: parseJson(row.completed_indexes, []),
    lastOpenedAt: row.last_opened_at
  }));

  const signals = (signalRows.results || []).map((row) => ({
    signalType: row.signal_type,
    selectedKeys: parseJson(row.selected_keys, []),
    updatedAt: row.updated_at
  }));

  const reports = (reportRows.results || []).map((row) => ({
    id: row.id,
    reportType: row.report_type,
    readinessStage: row.readiness_stage,
    summary: parseJson(row.summary_json, {}),
    createdAt: row.created_at
  }));

  const visibilityAudits = (auditRows.results || []).map((row) => ({
    id: row.id,
    mode: row.mode,
    businessName: row.business_name,
    score: row.score,
    label: row.label,
    sourceMode: row.source_mode,
    engine: row.engine,
    result: parseJson(row.result_json, {}),
    createdAt: row.created_at
  }));

  const notes = (noteRows.results || []).map((row) => ({
    id: row.id,
    adminEmail: row.admin_email,
    note: row.note,
    createdAt: row.created_at
  }));

  const activity = (activityRows.results || []).map((row) => ({
    id: row.id,
    adminEmail: row.admin_email,
    action: row.action,
    details: parseJson(row.details, {}),
    createdAt: row.created_at
  }));

  const accessEvents = (accessRows.results || []).map((row) => ({
    pagePath: row.page_path,
    eventType: row.event_type,
    createdAt: row.created_at
  }));

  const stripeCustomer = member.stripe_customer_id || '';
  const billingLinks = {
    stripeCustomer: stripeCustomer ? `https://dashboard.stripe.com/customers/${stripeCustomer}` : '',
    stripeSubscription: member.stripe_subscription_id ? `https://dashboard.stripe.com/subscriptions/${member.stripe_subscription_id}` : ''
  };

  return json({ member, profile: profile || null, resume: resume || null, progress, signals, reports, visibilityAudits, notes, activity, readinessLock: readinessLock || null, accessEvents, billingLinks });
}
