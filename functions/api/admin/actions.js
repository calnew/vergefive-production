import { cleanLimited, getAuth, isAdminEmail, json, readJson, requireSameOrigin } from '../../_lib/auth.js';
import { ensureAdminSchema, logAdminAction } from '../../_lib/admin.js';
import { sendAdminEmail } from '../../_lib/security.js';
import { stripeGet, stripeRequest } from '../../_lib/stripe.js';

async function requireAdmin(context) {
  const auth = context.data.auth || await getAuth(context.request, context.env);
  return auth && isAdminEmail(auth.user.email, context.env) ? auth : null;
}

function addDays(days) {
  return new Date(Date.now() + Number(days || 0) * 24 * 60 * 60 * 1000).toISOString();
}

async function createResetUrl(context, userId, email) {
  const token = crypto.randomUUID() + '-' + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  await context.env.DB.prepare(
    `insert into password_reset_tokens (id, user_id, token, email, expires_at, created_at)
     values (?, ?, ?, ?, ?, datetime('now'))`
  ).bind(crypto.randomUUID(), userId, token, email, expiresAt).run();
  const origin = String(context.env.SITE_URL || '') || new URL(context.request.url).origin;
  return `${origin}/reset-password/?token=${encodeURIComponent(token)}`;
}

export async function onRequestPost(context) {
  const originError = requireSameOrigin(context);
  if (originError) return originError;
  const auth = await requireAdmin(context);
  if (!auth) return json({ error: 'Admin access required.' }, 403);
  await ensureAdminSchema(context.env);
  const input = await readJson(context.request).catch(() => ({}));
  const action = String(input.action || '').toLowerCase();

  if (action === 'create-test-coupons') {
    const coupons = await Promise.all([
      ensureStripePromotionCode(context.env, { code: 'VFTEST95', percentOff: 95 }),
      ensureStripePromotionCode(context.env, { code: 'VFTEST99', percentOff: 99 })
    ]);
    const failed = coupons.find((item) => item instanceof Response);
    if (failed) return failed;
    await logAdminAction(context.env, auth, 'create-test-coupons', auth.user.id, { codes: coupons.map((item) => item.code) });
    return json({ ok: true, coupons });
  }

  const memberId = cleanLimited(input.memberId || input.userId, 80);
  if (!memberId) return json({ error: 'Member ID is required.' }, 400);

  const member = await context.env.DB.prepare('select id, email, name from users where id = ? limit 1').bind(memberId).first();
  if (!member) return json({ error: 'Member not found.' }, 404);

  if (action === 'update-status') {
    const allowed = ['pending', 'trial', 'active', 'trialing', 'paid', 'lifetime', 'paused', 'canceled', 'expired', 'none'];
    const status = cleanLimited(input.status, 40).toLowerCase();
    if (!allowed.includes(status)) return json({ error: 'Unsupported membership status.' }, 400);
    const periodEnd = cleanLimited(input.currentPeriodEnd, 80) || null;
    const plan = cleanLimited(input.plan, 80) || null;
    await context.env.DB.prepare(
      `insert into memberships (user_id, status, current_period_end, plan, created_at, updated_at)
       values (?, ?, ?, ?, datetime('now'), datetime('now'))
       on conflict(user_id) do update set status = excluded.status, current_period_end = excluded.current_period_end, plan = excluded.plan, updated_at = datetime('now')`
    ).bind(memberId, status, periodEnd, plan).run();
    await logAdminAction(context.env, auth, 'update-status', memberId, { status, currentPeriodEnd: periodEnd, plan });
    return json({ ok: true });
  }

  if (action === 'extend-trial') {
    const days = Math.max(1, Math.min(365, Number(input.days || 30)));
    const current = await context.env.DB.prepare('select current_period_end from memberships where user_id = ?').bind(memberId).first();
    const base = current && current.current_period_end && Date.parse(current.current_period_end) > Date.now() ? Date.parse(current.current_period_end) : Date.now();
    const periodEnd = new Date(base + days * 24 * 60 * 60 * 1000).toISOString();
    await context.env.DB.prepare(
      `insert into memberships (user_id, status, current_period_end, created_at, updated_at)
       values (?, 'trial', ?, datetime('now'), datetime('now'))
       on conflict(user_id) do update set status = 'trial', current_period_end = excluded.current_period_end, updated_at = datetime('now')`
    ).bind(memberId, periodEnd).run();
    await logAdminAction(context.env, auth, 'extend-trial', memberId, { days, currentPeriodEnd: periodEnd });
    return json({ ok: true, currentPeriodEnd: periodEnd });
  }

  if (action === 'verify-email') {
    await context.env.DB.prepare('update users set email_verified_at = coalesce(email_verified_at, datetime("now")) where id = ?').bind(memberId).run();
    await logAdminAction(context.env, auth, 'verify-email', memberId, {});
    return json({ ok: true });
  }

  if (action === 'reset-password') {
    const resetUrl = await createResetUrl(context, member.id, member.email);
    await logAdminAction(context.env, auth, 'create-password-reset', memberId, { email: member.email });
    return json({ ok: true, resetUrl, expiresInMinutes: 60 });
  }

  if (action === 'clear-progress') {
    await context.env.DB.prepare('delete from lesson_progress where user_id = ?').bind(memberId).run();
    await context.env.DB.prepare('delete from readiness_signals where user_id = ?').bind(memberId).run();
    await context.env.DB.prepare('delete from resume_locations where user_id = ?').bind(memberId).run();
    await logAdminAction(context.env, auth, 'clear-progress', memberId, {});
    return json({ ok: true });
  }

  if (action === 'send-email') {
    const subject = cleanLimited(input.subject, 180);
    const message = cleanLimited(input.message, 8000);
    if (!subject) return json({ error: 'Email subject is required.' }, 400);
    if (!message) return json({ error: 'Email message is required.' }, 400);
    const result = await sendAdminEmail(context.env, member.email, subject, message, auth.user.email);
    if (!result.sent) return json({ error: `Email was not sent: ${result.reason || 'email provider unavailable'}` }, 503);
    await logAdminAction(context.env, auth, 'send-email', memberId, { to: member.email, subject });
    return json({ ok: true, sent: true });
  }
  if (action === 'add-note') {
    const note = cleanLimited(input.note, 2000);
    if (!note) return json({ error: 'Note is required.' }, 400);
    await context.env.DB.prepare(
      `insert into admin_notes (id, user_id, admin_email, note, created_at)
       values (?, ?, ?, ?, datetime('now'))`
    ).bind(crypto.randomUUID(), memberId, auth.user.email, note).run();
    await logAdminAction(context.env, auth, 'add-note', memberId, { note: note.slice(0, 120) });
    return json({ ok: true });
  }

  return json({ error: 'Unsupported admin action.' }, 400);
}

async function ensureStripePromotionCode(env, options) {
  const code = String(options.code || '').trim().toUpperCase();
  const percentOff = Number(options.percentOff || 0);
  const existing = await stripeGet(env, '/promotion_codes', { code, active: true, limit: 1 });
  if (existing instanceof Response) return existing;
  if (existing.data && existing.data[0]) {
    const promo = existing.data[0];
    return { code, percentOff, promotionCodeId: promo.id, couponId: promo.coupon && promo.coupon.id || promo.promotion && promo.promotion.coupon, existed: true };
  }
  const coupon = await stripeRequest(env, '/coupons', {
    name: `Verge Five test ${percentOff}% off`,
    percent_off: percentOff,
    duration: 'once',
    metadata: { purpose: 'verge-five-live-checkout-test' }
  });
  if (coupon instanceof Response) return coupon;
  const promo = await stripeRequest(env, '/promotion_codes', {
    promotion: { type: 'coupon', coupon: coupon.id },
    code,
    active: true,
    max_redemptions: 10,
    metadata: { purpose: 'verge-five-live-checkout-test' }
  });
  if (promo instanceof Response) return promo;
  return { code, percentOff, promotionCodeId: promo.id, couponId: coupon.id, existed: false };
}