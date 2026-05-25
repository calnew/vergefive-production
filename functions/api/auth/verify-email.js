import { json, readJson, requireDb, requireSameOrigin } from '../../_lib/auth.js';

export async function onRequestPost(context) {
  try {
    const originError = requireSameOrigin(context);
    if (originError) return originError;
    requireDb(context.env);
    const input = await readJson(context.request);
    const token = String(input.token || '').trim();
    if (!token) return json({ error: 'Verification token is required.' }, 400);

    const row = await context.env.DB.prepare(
      `select * from email_verification_tokens
       where token = ? and consumed_at is null and expires_at > datetime("now")
       limit 1`
    ).bind(token).first();
    if (!row) return json({ error: 'Verification link is invalid or expired.' }, 400);

    await context.env.DB.prepare('update users set email_verified_at = datetime("now") where id = ?').bind(row.user_id).run();
    await context.env.DB.prepare('update email_verification_tokens set consumed_at = datetime("now") where id = ?').bind(row.id).run();
    return json({ ok: true });
  } catch (error) {
    console.error('verify email failed', error && error.message ? error.message : error);
    return json({ error: 'Unable to verify email.' }, 500);
  }
}
