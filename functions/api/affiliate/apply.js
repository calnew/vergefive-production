import { cleanLimited, json, rateLimit, readJson, requireSameOrigin } from '../../_lib/auth.js';
import { normalizeAffiliateCode } from '../../_lib/affiliates.js';

export async function onRequestPost(context) {
  const originError = requireSameOrigin(context);
  if (originError) return originError;
  if (!context.env.DB) return json({ error: 'Application storage is not configured.' }, 500);
  const input = await readJson(context.request).catch(() => ({}));
  const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';
  const limited = await rateLimit(context.env, `affiliate:${ip}`, { limit: 5, windowSeconds: 3600 });
  if (!limited.ok) return limited.response;
  const name = cleanLimited(input.name, 120);
  const email = cleanLimited(input.email, 180).toLowerCase();
  const requestedCode = normalizeAffiliateCode(input.code || name.replace(/\s+/g, '-'));
  if (!name) return json({ error: 'Enter your name.' }, 400);
  if (!email || !email.includes('@')) return json({ error: 'Enter a valid email address.' }, 400);
  if (!requestedCode) return json({ error: 'Enter a preferred affiliate code.' }, 400);

  const existing = await context.env.DB.prepare(
    'select id, status from affiliates where lower(email) = ? or lower(code) = ? limit 1'
  ).bind(email, requestedCode).first();
  if (existing) {
    return json({ ok: true, message: 'Your affiliate application is already on file.' });
  }

  await context.env.DB.prepare(
    `insert into affiliates
      (id, code, name, email, status, commission_amount_cents, monthly_qualifying_payments, created_at, updated_at)
     values (?, ?, ?, ?, 'pending', 6000, 3, datetime("now"), datetime("now"))`
  ).bind(crypto.randomUUID(), requestedCode, name, email).run();

  return json({
    ok: true,
    message: 'Application received. Verge Five will review it before issuing an active affiliate link.'
  });
}
