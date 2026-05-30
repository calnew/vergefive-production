import { cleanLimited, createSession, hashPassword, json, normalizeEmail, rateLimit, readJson, requireDb, requireSameOrigin, validatePasswordPolicy } from '../../_lib/auth.js';
import { createEmailVerification } from '../../_lib/security.js';
import { attachReferralToUser, normalizeAffiliateCode } from '../../_lib/affiliates.js';
import { ensureAdminSchema } from '../../_lib/admin.js';

export async function onRequestPost(context) {
  try {
    const originError = requireSameOrigin(context);
    if (originError) return originError;
    requireDb(context.env);
    const input = await readJson(context.request);
    const email = normalizeEmail(input.email);
    const password = String(input.password || '');
    const name = cleanLimited(input.name, 120);
    const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';
    const limited = await rateLimit(context.env, `register:${ip}`, { limit: 5, windowSeconds: 3600 });
    if (!limited.ok) return limited.response;
    if (!email || !email.includes('@')) return json({ error: 'Enter a valid email address.' }, 400);
    const passwordError = validatePasswordPolicy(password);
    if (passwordError) return json({ error: passwordError }, 400);

    const existing = await context.env.DB.prepare('select id from users where email = ?').bind(email).first();
    if (existing) return json({ error: 'An account already exists for that email.' }, 409);

    const id = crypto.randomUUID();
    const hashed = await hashPassword(password);
    await context.env.DB.prepare(
      `insert into users
        (id, email, name, auth_provider, password_hash, password_salt, password_iterations, created_at)
       values (?, ?, ?, 'password', ?, ?, ?, datetime("now"))`
    ).bind(id, email, name, hashed.hash, hashed.salt, hashed.iterations).run();
    const trialDays = Math.max(1, Math.min(30, Number(context.env.TRIAL_DAYS || 30)));
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();
    await context.env.DB.prepare(
      `insert into memberships (user_id, status, current_period_end, created_at, updated_at)
       values (?, 'trial', ?, datetime("now"), datetime("now"))`
    ).bind(id, trialEndsAt).run();
    const legacyToken = cleanLimited(input.legacyToken || input.legacy || '', 120);
    if (legacyToken) {
      await ensureAdminSchema(context.env);
      await context.env.DB.prepare(
        `update legacy_leads
         set registered_at = datetime('now'),
             user_id = ?,
             status = 'registered',
             updated_at = datetime('now')
         where token = ? and registered_at is null`
      ).bind(id, legacyToken).run();
    } else {
      try {
        await ensureAdminSchema(context.env);
        await context.env.DB.prepare(
          `update legacy_leads
           set registered_at = datetime('now'),
               user_id = ?,
               status = 'registered',
               updated_at = datetime('now')
           where email = ? and registered_at is null`
        ).bind(id, email).run();
      } catch (error) {
        if (!/no such table/i.test(String(error && error.message || error))) throw error;
      }
    }
    const affiliateCode = normalizeAffiliateCode(input.affiliateCode || input.ref || '');
    if (affiliateCode) await attachReferralToUser(context.env, id, affiliateCode, context.request);
    const verification = await createEmailVerification(context.env, id, email, context.request);
    const cookie = await createSession(context.env, id, context.request);
    return json({
      ok: true,
      user: { id, email, name, emailVerified: false },
      membership: { status: 'trial', currentPeriodEnd: trialEndsAt, trialDays },
      emailVerification: {
        required: String(context.env.REQUIRE_EMAIL_VERIFICATION || '').toLowerCase() === 'true',
        emailProviderConfigured: !!(context.env.RESEND_API_KEY && context.env.EMAIL_FROM),
        verificationUrl: context.env.RESEND_API_KEY ? undefined : verification.url
      }
    }, 200, { 'set-cookie': cookie });
  } catch (error) {
    console.error('register failed', error && error.message ? error.message : error);
    return json({ error: 'Unable to create account.' }, 500);
  }
}
