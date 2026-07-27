import { json, normalizeEmail, rateLimit, readJson, requireDb, requireSameOrigin } from '../../_lib/auth.js';
import { createPasswordReset } from '../../_lib/security.js';
import { allowDevelopmentDebugLink } from '../../_lib/security.js';

export async function onRequestPost(context) {
  try {
    const originError = requireSameOrigin(context);
    if (originError) return originError;
    requireDb(context.env);
    const input = await readJson(context.request);
    const email = normalizeEmail(input.email);
    const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';
    const limited = await rateLimit(context.env, `password-reset:${ip}:${email}`, { limit: 5, windowSeconds: 3600 });
    if (!limited.ok) return limited.response;
    let resetUrl;
    if (email && email.includes('@')) {
      const user = await context.env.DB.prepare('select id, email from users where email = ?').bind(email).first();
      if (user) {
        resetUrl = await createPasswordReset(context.env, user.id, user.email, context.request);
        if (resetUrl && resetUrl.emailResult && !resetUrl.emailResult.sent) console.error('password reset email failed', resetUrl.emailResult);
      }
    }

    return json({
      ok: true,
      message: 'If that email is in our system, a password reset link has been sent.',
      resetUrl: allowDevelopmentDebugLink(context.env, 'PASSWORD_RESET_DEBUG_LINKS') ? (resetUrl && resetUrl.url || resetUrl) : undefined
    });
  } catch (error) {
    console.error('password reset request failed', error && error.message ? error.message : error);
    return json({ error: 'Unable to request password reset.' }, 500);
  }
}
