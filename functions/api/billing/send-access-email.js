import { json, normalizeEmail, rateLimit, readJson, requireDb, requireSameOrigin } from '../../_lib/auth.js';
import { createPasswordReset } from '../../_lib/security.js';

export async function onRequestPost(context) {
  try {
    const originError = requireSameOrigin(context);
    if (originError) return originError;
    requireDb(context.env);
    const input = await readJson(context.request).catch(() => ({}));
    const email = normalizeEmail(input.email);
    if (!email || !email.includes('@')) return json({ error: 'Enter the email used for membership access.' }, 400);

    const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';
    const limited = await rateLimit(context.env, `access-email:${ip}:${email}`, { limit: 5, windowSeconds: 3600 });
    if (!limited.ok) return limited.response;

    const member = await context.env.DB.prepare(
      `select u.id, u.email, coalesce(m.status, 'none') as membership_status
       from users u
       left join memberships m on m.user_id = u.id
       where u.email = ?
       limit 1`
    ).bind(email).first();

    const activeStatuses = ['active', 'paid', 'trialing', 'lifetime'];
    if (!member || !activeStatuses.includes(String(member.membership_status || '').toLowerCase())) {
      return json({ ok: true, message: 'If that email has paid access, an access email has been sent.' });
    }

    const reset = await createPasswordReset(context.env, member.id, member.email, context.request);
    const emailResult = reset && reset.emailResult ? reset.emailResult : {};
    if (!emailResult.sent) {
      console.error('access email failed', emailResult);
      return json({ error: 'Access link was created, but Resend did not accept the email.', detail: safeEmailError(emailResult) }, 502);
    }
    return json({ ok: true, message: 'Access email sent. Check the inbox used at checkout.', emailId: emailResult.id || '' });
  } catch (error) {
    console.error('access email request failed', error && error.message ? error.message : error);
    return json({ error: 'Unable to send access email.' }, 500);
  }
}

function safeEmailError(result) {
  const raw = result && result.reason ? String(result.reason) : 'No response from email provider.';
  return raw.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]').slice(0, 500);
}