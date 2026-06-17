import { clean, json } from './auth.js';

export async function verifyTurnstile(context, token) {
  if (!context.env.TURNSTILE_SECRET_KEY) return { ok: true, skipped: true };
  if (!token) return { ok: false, response: json({ error: 'Security check is required.' }, 400) };

  const form = new FormData();
  form.append('secret', context.env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  const ip = context.request.headers.get('cf-connecting-ip');
  if (ip) form.append('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form
  });
  const data = await response.json().catch(() => ({}));
  if (!data.success) return { ok: false, response: json({ error: 'Security check failed. Please try again.' }, 400) };
  return { ok: true };
}

export async function createEmailVerification(env, userId, email, request) {
  const token = crypto.randomUUID() + '-' + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
  await env.DB.prepare(
    `insert into email_verification_tokens (id, user_id, token, email, expires_at, created_at)
     values (?, ?, ?, ?, ?, datetime("now"))`
  ).bind(crypto.randomUUID(), userId, token, email, expiresAt).run();
  const origin = clean(env.SITE_URL) || new URL(request.url).origin;
  const url = `${origin}/verify-email/?token=${encodeURIComponent(token)}`;
  await sendVerificationEmail(env, email, url);
  return url;
}

export async function sendVerificationEmail(env, email, url) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return { sent: false, reason: 'email provider not configured' };
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [email],
      subject: 'Verify your Verge Five account',
      html: `<p>Welcome to Verge Five.</p><p>Verify your email address to secure your account:</p><p><a href="${url}">Verify email</a></p><p>This link expires in 24 hours.</p>`
    })
  });
  if (!response.ok) return { sent: false, reason: await response.text().catch(() => 'send failed') };
  return { sent: true };
}
