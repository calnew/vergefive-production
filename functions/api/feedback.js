import { cleanLimited, getAuth, json, normalizeEmail, rateLimit, readJson, requireSameOrigin } from '../_lib/auth.js';
import { sendAdminEmail } from '../_lib/security.js';

async function storeSupportRequest(env, data) {
  if (!env.DB) return '';
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `insert into support_requests
      (id, user_id, type, severity, name, email, page_url, message, steps, browser, source, status, created_at)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', datetime('now'))`
  ).bind(id, data.userId || null, data.type, data.severity, data.name, data.email, data.pageUrl, data.message, data.steps, data.browser, data.source || 'feedback').run();
  return id;
}

function firstAdminEmail(env) {
  return String(env.ADMIN_EMAILS || '').split(',').map((item) => item.trim()).filter(Boolean)[0] || '';
}

export async function onRequestPost(context) {
  const sameOrigin = requireSameOrigin(context);
  if (sameOrigin) return sameOrigin;
  const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';
  const limited = await rateLimit(context.env, `feedback:${ip}`, { limit: 8, windowSeconds: 900 });
  if (!limited.ok) return limited.response;
  let body = {};
  try { body = await readJson(context.request, 16 * 1024); } catch (error) { return json({ error: 'Invalid feedback request.' }, 400); }
  if (cleanLimited(body.company, 100)) return json({ ok: true });
  const auth = await getAuth(context.request, context.env).catch(() => null);
  const type = cleanLimited(body.type, 40) || 'Report a problem';
  const name = cleanLimited(body.name, 120) || (auth && auth.user && auth.user.name) || 'Member';
  const email = normalizeEmail(body.email) || (auth && auth.user && auth.user.email) || '';
  const pageUrl = cleanLimited(body.pageUrl, 500) || cleanLimited(body.currentUrl, 500) || '';
  const severity = cleanLimited(body.severity, 60) || 'Normal';
  const message = cleanLimited(body.message, 6000);
  const steps = cleanLimited(body.steps, 4000);
  const browser = cleanLimited(body.browser, 400);
  const adminEmail = firstAdminEmail(context.env);
  if (!email || !message) return json({ error: 'Email and message are required.' }, 400);
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Enter a valid email address.' }, 400);
  if (!adminEmail) return json({ error: 'Feedback routing is not configured yet.' }, 500);
  const storedId = await storeSupportRequest(context.env, { userId: auth && auth.user ? auth.user.id : '', type, severity, name, email, pageUrl, message, steps, browser, source: 'feedback' }).catch(() => '');
  const formatted = [`Type: ${type}`, `Severity: ${severity}`, `Name: ${name}`, `Email: ${email}`, auth && auth.user ? `Member user id: ${auth.user.id}` : 'Member user id: Not logged in', pageUrl ? `Page: ${pageUrl}` : 'Page: Not provided', browser ? `Browser: ${browser}` : '', '', 'Message:', message, steps ? `\nSteps to reproduce / extra detail:\n${steps}` : ''].filter(Boolean).join('\n');
  const result = await sendAdminEmail(context.env, adminEmail, `Verge Five ${type}: ${severity}`, formatted, email);
  if (!result.sent) return json({ error: 'Feedback could not be sent yet.' }, 502);
  return json({ ok: true, id: result.id || '', requestId: storedId });
}
