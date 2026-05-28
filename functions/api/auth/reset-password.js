import { expiredSessionCookie, hashPassword, json, rateLimit, readJson, requireDb, requireSameOrigin, validatePasswordPolicy } from '../../_lib/auth.js';

export async function onRequestPost(context) {
  try {
    const originError = requireSameOrigin(context);
    if (originError) return originError;
    requireDb(context.env);
    const input = await readJson(context.request);
    const token = String(input.token || '').trim();
    const password = String(input.password || '');
    const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';
    const limited = await rateLimit(context.env, `password-reset-confirm:${ip}`, { limit: 8, windowSeconds: 3600 });
    if (!limited.ok) return limited.response;
    if (!token) return json({ error: 'Password reset token is required.' }, 400);
    const passwordError = validatePasswordPolicy(password);
    if (passwordError) return json({ error: passwordError }, 400);

    const tokenRow = await context.env.DB.prepare(
      `select * from password_reset_tokens
       where token = ?
       limit 1`
    ).bind(token).first();
    if (!tokenRow) return json({ error: 'Password reset link is invalid or expired.' }, 400);
    if (tokenRow.consumed_at) {
      return json({ error: 'This password reset link has already been used. Try logging in with the new password or request another reset link.' }, 400);
    }
    if (Date.parse(tokenRow.expires_at || '') <= Date.now()) {
      return json({ error: 'Password reset link is expired. Request another reset link.' }, 400);
    }

    const hashed = await hashPassword(password);
    await context.env.DB.prepare(
      `update users
       set password_hash = ?, password_salt = ?, password_iterations = ?
       where id = ?`
    ).bind(hashed.hash, hashed.salt, hashed.iterations, tokenRow.user_id).run();
    await context.env.DB.prepare('update password_reset_tokens set consumed_at = datetime("now") where id = ?').bind(tokenRow.id).run();
    await context.env.DB.prepare('delete from sessions where user_id = ?').bind(tokenRow.user_id).run();
    return json({ ok: true, message: 'Password updated. Please log in with your new password.' }, 200, { 'set-cookie': expiredSessionCookie(context.request) });
  } catch (error) {
    console.error('password reset confirm failed', error && error.message ? error.message : error);
    return json({ error: 'Unable to reset password.' }, 500);
  }
}