import { cleanLimited } from './auth.js';

export async function ensureAdminSchema(env) {
  if (!env.DB) throw new Error('D1 binding DB is not configured.');
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
