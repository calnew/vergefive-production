import { cleanLimited, getAuth, json, normalizeEmail, rateLimit, readJson, requireSameOrigin } from '../_lib/auth.js';
import { sendAdminEmail } from '../_lib/security.js';

async function storeSupportRequest(env, data) {
  if (!env.DB) return '';
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `insert into support_requests
      (id, user_id, type, severity, name, email, page_url, message, steps, browser, source, fix_key, selected_option, status, created_at)
     values (?, ?, ?, ?, ?, ?, ?, ?, '', '', ?, ?, ?, 'new', datetime('now'))`
  ).bind(
    id,
    data.userId || null,
    data.type,
    data.severity,
    data.name,
    data.email,
    data.pageUrl || '',
    data.message,
    data.source || 'contact',
    data.fixKey || '',
    data.selectedOption || ''
  ).run();
  return id;
}

function parseKeys(value) {
  try {
    const parsed = JSON.parse(String(value || '[]'));
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

async function trustedFixContext(env, auth, requestedFixKey) {
  const fixKey = requestedFixKey === 'phones' ? 'phones' : '';
  if (!fixKey || !auth || !auth.user || !env.DB) {
    return { fixKey: '', selectedOption: '', pageUrl: '', source: 'support' };
  }
  const row = await env.DB.prepare(
    'select selected_keys from readiness_signals where user_id = ? and signal_type = ? limit 1'
  ).bind(auth.user.id, `selected_option:${fixKey}`).first();
  return {
    fixKey,
    selectedOption: parseKeys(row && row.selected_keys)[0] || '',
    pageUrl: `/fix/${fixKey}/`,
    source: 'fix-flow'
  };
}

function firstAdminEmail(env) {
  return String(env.ADMIN_EMAILS || '').split(',').map((item) => item.trim()).filter(Boolean)[0] || '';
}

export async function onRequestPost(context) {
  const sameOrigin = requireSameOrigin(context);
  if (sameOrigin) return sameOrigin;

  const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';
  const limited = await rateLimit(context.env, `contact:${ip}`, { limit: 5, windowSeconds: 900 });
  if (!limited.ok) return limited.response;

  let body = {};
  try {
    body = await readJson(context.request, 12 * 1024);
  } catch (error) {
    return json({ error: 'Invalid contact request.' }, 400);
  }

  if (cleanLimited(body.company, 100)) return json({ ok: true });

  const name = cleanLimited(body.name, 120);
  const email = normalizeEmail(body.email);
  const topic = cleanLimited(body.topic, 140);
  const message = cleanLimited(body.message, 4000);
  const auth = await getAuth(context.request, context.env).catch(() => null);
  const contextData = await trustedFixContext(context.env, auth, cleanLimited(body.fixKey, 80));
  const { fixKey, selectedOption, pageUrl, source } = contextData;
  const adminEmail = firstAdminEmail(context.env);

  if (!name || !email || !topic || !message) return json({ error: 'Name, email, topic, and message are required.' }, 400);
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Enter a valid email address.' }, 400);
  const storedId = await storeSupportRequest(context.env, {
    userId: auth && auth.user ? auth.user.id : '',
    type: topic || 'Website contact',
    severity: 'Normal',
    name,
    email,
    pageUrl,
    message,
    source,
    fixKey,
    selectedOption
  }).catch(() => '');

  const formatted = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Topic: ${topic}`,
    fixKey ? `Fix area: ${fixKey}` : '',
    selectedOption ? `Selected option: ${selectedOption}` : '',
    pageUrl ? `Page: ${pageUrl}` : '',
    auth && auth.user ? `Member user id: ${auth.user.id}` : '',
    '',
    message
  ].filter(Boolean).join('\n');
  const result = adminEmail
    ? await sendAdminEmail(context.env, adminEmail, `Website contact: ${topic}`, formatted, email)
    : { sent: false, reason: 'admin_email_missing' };
  if (fixKey && !storedId) return json({ error: 'Fix context could not be saved to the support queue.' }, 502);
  if (!storedId && !result.sent) return json({ error: 'Message could not be saved or routed yet.' }, 502);
  return json({
    ok: true,
    id: result.id || '',
    requestId: storedId,
    notificationSent: !!result.sent,
    context: { fixKey, selectedOption, pageUrl }
  });
}
