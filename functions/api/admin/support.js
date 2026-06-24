import { getAuth, isAdminEmail, json } from '../../_lib/auth.js';

async function requireAdmin(context) {
  const auth = context.data.auth || await getAuth(context.request, context.env);
  return auth && isAdminEmail(auth.user.email, context.env) ? auth : null;
}

async function ensureSupportTable(env) {
  if (!env.DB) return;
  await env.DB.prepare(`create table if not exists support_requests (
    id text primary key,
    user_id text,
    type text,
    severity text,
    name text,
    email text,
    page_url text,
    message text,
    steps text,
    browser text,
    source text,
    status text not null default 'new',
    created_at text not null default (datetime('now'))
  )`).run();
  await env.DB.prepare('create index if not exists idx_support_requests_created on support_requests(created_at)').run();
}

export async function onRequestGet(context) {
  const auth = await requireAdmin(context);
  if (!auth) return json({ error: 'Admin access required.' }, 403);
  await ensureSupportTable(context.env);
  const rows = await context.env.DB.prepare(
    `select id, user_id, type, severity, name, email, page_url, message, steps, browser, source, status, created_at
     from support_requests
     order by created_at desc
     limit 100`
  ).all();
  return json({ requests: rows.results || [] });
}
