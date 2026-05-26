import { createSession, isAdminEmail, json, normalizeEmail, rateLimit, readJson, requireDb, requireSameOrigin, verifyPassword } from '../../_lib/auth.js';

export async function onRequestPost(context) {
  try {
    const originError = requireSameOrigin(context);
    if (originError) return originError;
    requireDb(context.env);
    const input = await readJson(context.request);
    const email = normalizeEmail(input.email);
    const password = String(input.password || '');
    const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';
    const limited = await rateLimit(context.env, `login:${ip}:${email}`, { limit: 8, windowSeconds: 900 });
    if (!limited.ok) return limited.response;
    const user = await context.env.DB.prepare('select * from users where email = ?').bind(email).first();
    const valid = await verifyPassword(password, user);
    if (!valid) return json({ error: 'Email or password is incorrect.' }, 401);
    if (String(context.env.REQUIRE_EMAIL_VERIFICATION || '').toLowerCase() === 'true' && !user.email_verified_at) {
      return json({ error: 'Please verify your email address before logging in.' }, 403);
    }
    const cookie = await createSession(context.env, user.id, context.request);
    return json({ ok: true, isAdmin: isAdminEmail(user.email, context.env), user: { id: user.id, email: user.email, name: user.name || '', emailVerified: !!user.email_verified_at } }, 200, { 'set-cookie': cookie });
  } catch (error) {
    console.error('login failed', error && error.message ? error.message : error);
    return json({ error: 'Unable to log in.' }, 500);
  }
}
