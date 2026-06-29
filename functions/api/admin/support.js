import { getAuth, isAdminUser, json } from '../../_lib/auth.js';
import { ensureAdminSchema } from '../../_lib/admin.js';

async function requireAdmin(context) {
  const auth = context.data.auth || await getAuth(context.request, context.env);
  return auth && await isAdminUser(auth.user.email, context.env) ? auth : null;
}

async function ensureSupportTable(env) {
  await ensureAdminSchema(env);
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
