import { cleanLimited, json, normalizeEmail, rateLimit, readJson, requireSameOrigin } from '../_lib/auth.js';
import { sendAdminEmail } from '../_lib/security.js';

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
  const adminEmail = firstAdminEmail(context.env);

  if (!name || !email || !topic || !message) return json({ error: 'Name, email, topic, and message are required.' }, 400);
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Enter a valid email address.' }, 400);
  if (!adminEmail) return json({ error: 'Contact routing is not configured yet.' }, 500);

  const formatted = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Topic: ${topic}`,
    '',
    message
  ].join('\n');
  const result = await sendAdminEmail(context.env, adminEmail, `Website contact: ${topic}`, formatted, email);
  if (!result.sent) return json({ error: 'Message could not be sent yet.' }, 502);
  return json({ ok: true, id: result.id || '' });
}
