import { cleanLimited } from './auth.js';
import { ensureReadinessLockSchema } from './readiness-locks.js';

export async function ensureAdminSchema(env) {
  if (!env.DB) return;
  await env.DB.prepare(`create table if not exists admin_notes (
    id text primary key,
    user_id text not null references users(id) on delete cascade,
    admin_email text,
    note text not null,
    created_at text not null default (datetime('now'))
  )`).run();
  await env.DB.prepare(`create table if not exists admin_activity_log (
    id text primary key,
    admin_email text,
    user_id text references users(id) on delete set null,
    action text not null,
    details text,
    created_at text not null default (datetime('now'))
  )`).run();
  await env.DB.prepare('create index if not exists idx_admin_notes_user on admin_notes(user_id, created_at)').run();
  await env.DB.prepare('create index if not exists idx_admin_activity_user on admin_activity_log(user_id, created_at)').run();
  await env.DB.prepare('create index if not exists idx_admin_activity_admin on admin_activity_log(admin_email, created_at)').run();
  await addColumn(env, 'memberships', 'plan', 'text');
  await addColumn(env, 'memberships', 'stripe_price_id', 'text');
  await ensureReadinessLockSchema(env);
  await env.DB.prepare(`create table if not exists legacy_campaigns (
    id text primary key,
    name text not null,
    subject text not null,
    message text not null,
    created_at text not null default (datetime('now')),
    updated_at text not null default (datetime('now'))
  )`).run();
  await env.DB.prepare(`create table if not exists legacy_leads (
    id text primary key,
    campaign_id text not null references legacy_campaigns(id) on delete cascade,
    first_name text,
    last_name text,
    email text not null,
    phone text,
    source text,
    status text not null default 'imported',
    token text not null unique,
    email_sent_at text,
    email_send_count integer not null default 0,
    clicked_at text,
    click_count integer not null default 0,
    registered_at text,
    user_id text references users(id) on delete set null,
    do_not_contact integer not null default 0,
    created_at text not null default (datetime('now')),
    updated_at text not null default (datetime('now'))
  )`).run();
  await addColumn(env, 'legacy_leads', 'phone', 'text');
  await addColumn(env, 'legacy_leads', 'business_name', 'text');
  await addColumn(env, 'legacy_leads', 'email_last_provider_id', 'text');
  await addColumn(env, 'legacy_leads', 'email_last_result', 'text');
  await addColumn(env, 'legacy_campaigns', 'preview_text', 'text');
  await env.DB.prepare('create index if not exists idx_legacy_leads_campaign on legacy_leads(campaign_id, created_at)').run();
  await env.DB.prepare('create index if not exists idx_legacy_leads_email on legacy_leads(email)').run();
  await env.DB.prepare('create index if not exists idx_legacy_leads_status on legacy_leads(status)').run();
  await env.DB.prepare('create index if not exists idx_legacy_leads_token on legacy_leads(token)').run();
}

async function addColumn(env, table, column, type) {
  const info = await env.DB.prepare(`pragma table_info(${table})`).all();
  const exists = (info.results || []).some((row) => row.name === column);
  if (!exists) await env.DB.prepare(`alter table ${table} add column ${column} ${type}`).run();
}

export async function logAdminAction(env, auth, action, userId = '', details = {}) {
  await ensureAdminSchema(env);
  await env.DB.prepare(
    `insert into admin_activity_log (id, admin_email, user_id, action, details, created_at)
     values (?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    crypto.randomUUID(),
    auth && auth.user ? cleanLimited(auth.user.email, 180) : '',
    userId || null,
    cleanLimited(action, 80),
    JSON.stringify(details || {})
  ).run();
}
