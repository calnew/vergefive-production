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
  const emailResult = await sendVerificationEmail(env, email, url);
  return { url, emailResult };
}

export async function sendVerificationEmail(env, email, url) {
  return await sendResendEmail(env, {
    to: email,
    subject: 'Verify your Verge Five account',
    html: `<p>Welcome to Verge Five.</p><p>Verify your email address to secure your account:</p><p><a href="${url}">Verify email</a></p><p>This link expires in 24 hours.</p><p>Verge Five team</p>`
  });
}

export async function createPasswordReset(env, userId, email, request) {
  const token = crypto.randomUUID() + '-' + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();
  await env.DB.prepare(
    `insert into password_reset_tokens (id, user_id, token, email, expires_at, created_at)
     values (?, ?, ?, ?, ?, datetime("now"))`
  ).bind(crypto.randomUUID(), userId, token, email, expiresAt).run();
  const origin = clean(env.SITE_URL) || new URL(request.url).origin;
  const url = `${origin}/reset-password/?token=${encodeURIComponent(token)}`;
  const emailResult = await sendPasswordResetEmail(env, email, url);
  return { url, emailResult };
}

export async function sendPasswordResetEmail(env, email, url) {
  return await sendResendEmail(env, {
    to: email,
    subject: 'Set your Verge Five password',
    html: `<p>Your Verge Five access is ready.</p><p>Use this link to set your password and enter the member platform:</p><p><a href="${url}">Set password</a></p><p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p><p>Verge Five team</p>`
  });
}

export async function sendAdminEmail(env, email, subject, message, adminEmail = '') {
  const safeSubject = String(subject || '').trim().slice(0, 180) || 'Message from Verge Five';
  const safeMessage = String(message || '').trim().slice(0, 8000);
  const paragraphs = safeMessage.split(/\n{2,}/).map((part) => `<p>${escapeHtml(part).replace(/\n/g, '<br>')}</p>`).join('');
  return await sendResendEmail(env, {
    to: email,
    replyTo: adminEmail || undefined,
    subject: safeSubject,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">${paragraphs}</div>`,
    text: safeMessage
  });
}

async function sendResendEmail(env, input) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return { sent: false, reason: 'email provider not configured in this Cloudflare environment. Missing RESEND_API_KEY or EMAIL_FROM.' };
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.to],
      reply_to: input.replyTo || undefined,
      subject: input.subject,
      html: input.html,
      text: input.text || undefined
    })
  });
  const body = await response.text().catch(() => '');
  let data = {};
  try { data = body ? JSON.parse(body) : {}; } catch (error) { data = {}; }
  if (!response.ok) {
    return { sent: false, status: response.status, reason: body || 'send failed' };
  }
  return { sent: true, status: response.status, id: data.id || '' };
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}