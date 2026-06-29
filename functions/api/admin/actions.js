import { cleanLimited, getAuth, isAdminUser, json, normalizeEmail, readJson, requireSameOrigin } from '../../_lib/auth.js';
import { ensureAdminSchema, logAdminAction } from '../../_lib/admin.js';
import { createPasswordReset, sendAdminEmail } from '../../_lib/security.js';
import { stripeGet, stripeRequest } from '../../_lib/stripe.js';
import { adminRequireReadinessReview, adminUnlockReadiness } from '../../_lib/readiness-locks.js';

async function requireAdmin(context) {
  const auth = context.data.auth || await getAuth(context.request, context.env);
  return auth && await isAdminUser(auth.user.email, context.env) ? auth : null;
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
function accessPlan(accessType, env) {
  const type = cleanLimited(accessType, 80).toLowerCase();
  if (type === 'potential_affiliate') return { status: 'lifetime', plan: 'potential_affiliate', periodEnd: null, label: 'Potential affiliate' };
  if (type === 'grandfathered') return { status: 'lifetime', plan: 'grandfathered', periodEnd: null, label: 'Grandfathered member' };
  if (type === 'paid_member') return { status: 'active', plan: 'manual_paid', periodEnd: null, label: 'Manual paid member' };
  if (type === 'internal_admin') return { status: 'lifetime', plan: 'internal_admin', periodEnd: null, label: 'Internal/admin' };
  const trialDays = Math.max(1, Math.min(365, Number(env.TRIAL_DAYS || 30)));
  return { status: 'trial', plan: 'test_drive', periodEnd: addDays(trialDays), label: 'Test drive', trialDays };
}

async function deleteMemberData(env, userId) {
  const tables = [
    'sessions',
    'email_verification_tokens',
    'password_reset_tokens',
    'memberships',
    'business_profiles',
    'lesson_progress',
    'readiness_signals',
    'resume_locations',
    'report_snapshots',
    'visibility_audits',
    'member_access_events',
    'member_readiness_locks',
    'member_preferences',
    'affiliate_commissions',
    'affiliate_referrals',
    'admin_notes'
  ];
  try {
    await env.DB.prepare('delete from affiliate_invoice_events where commission_id in (select id from affiliate_commissions where user_id = ?)').bind(userId).run();
  } catch (error) {
    if (!/no such table/i.test(String(error && error.message || error))) throw error;
  }
  for (const table of tables) {
    try {
      await env.DB.prepare(`delete from ${table} where user_id = ?`).bind(userId).run();
    } catch (error) {
      if (!/no such table/i.test(String(error && error.message || error))) throw error;
    }
  }
  await env.DB.prepare('update admin_activity_log set user_id = null where user_id = ?').bind(userId).run();
  await env.DB.prepare('delete from users where id = ?').bind(userId).run();
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

  if (action === 'create-member') {
    const email = normalizeEmail(input.email);
    const firstName = cleanLimited(input.firstName, 80);
    const lastName = cleanLimited(input.lastName, 80);
    const name = cleanLimited(input.name || [firstName, lastName].filter(Boolean).join(' '), 140);
    const phone = cleanLimited(input.phone, 80);
    const access = accessPlan(input.accessType || 'test_drive', context.env);
    const sendSetupEmail = input.sendSetupEmail !== false;
    if (!email || !email.includes('@')) return json({ error: 'Enter a valid email address.' }, 400);
    const existing = await context.env.DB.prepare('select id from users where email = ? limit 1').bind(email).first();
    if (existing) return json({ error: 'An account already exists for that email.' }, 409);
    const userId = crypto.randomUUID();
    await context.env.DB.prepare(
      `insert into users (id, email, name, auth_provider, email_verified_at, created_at)
       values (?, ?, ?, 'admin-created', datetime('now'), datetime('now'))`
    ).bind(userId, email, name).run();
    await context.env.DB.prepare(
      `insert into memberships (user_id, status, current_period_end, plan, created_at, updated_at)
       values (?, ?, ?, ?, datetime('now'), datetime('now'))`
    ).bind(userId, access.status, access.periodEnd, access.plan).run();
    if (phone) {
      await context.env.DB.prepare(
        `insert into business_profiles (user_id, phone, updated_at)
         values (?, ?, datetime('now'))
         on conflict(user_id) do update set phone = excluded.phone, updated_at = datetime('now')`
      ).bind(userId, phone).run();
    }
    const resetUrl = await createResetUrl(context, userId, email);
    await context.env.DB.prepare(
      `insert into admin_notes (id, user_id, admin_email, note, created_at)
       values (?, ?, ?, ?, datetime('now'))`
    ).bind(crypto.randomUUID(), userId, auth.user.email, `Admin-created account. Access type: ${access.label}.`).run();
    let emailSent = false;
    let emailReason = '';
    if (sendSetupEmail) {
      const greeting = firstName || name || 'there';
      const subject = access.plan === 'potential_affiliate' ? 'Your full access to the new Verge Five platform' : 'Set up your Verge Five account';
      const message = access.plan === 'potential_affiliate'
        ? `Hey ${greeting},\n\nThe new Verge Five platform is live, and I am giving you full access so you can walk through the entire scope of what has been built.\n\nThis is the resource we are using going forward, and the one I want you using when you are talking to people about building business credit the right way. It has been rebuilt from the ground up around how automated underwriting actually works today, so the people you send here are not getting the old guru playbook that gets businesses declined. They are getting a real, step-by-step buildout that gets approved by the algorithm.\n\nTake the time to test drive it. Click through every module, run the readiness checks, and look at the tools. Get familiar with the full flow so you can speak to it confidently when you are putting it in front of your audience.\n\nUse this secure link to set your password and access the platform:\n${resetUrl}\n\nAny constructive criticism is welcome. If something feels off, unclear, or could be sharper, tell me. This platform is going to keep evolving, and your feedback shapes where it goes next.\n\nGoing forward, this is the platform to point people to. It is how business credit gets built correctly in 2026 - not the wrong way the internet is still teaching.\n\nVerge Five team`
        : `Hey ${greeting},\n\nYour Verge Five account has been created. Use the secure link below to set your password and log in.\n\n${resetUrl}\n\nAccess type: ${access.label}.\n\nVerge Five team`;
      const sent = await sendAdminEmail(context.env, email, subject, message, auth.user.email);
      emailSent = !!sent.sent;
      emailReason = sent.reason || '';
    }
    await logAdminAction(context.env, auth, 'create-member', userId, { email, accessType: access.plan, status: access.status, setupEmailSent: emailSent, setupEmailReason: emailReason });
    return json({ ok: true, memberId: userId, resetUrl, setupEmailSent: emailSent, setupEmailReason: emailReason });
  }
  const memberId = cleanLimited(input.memberId || input.userId, 80);
  if (!memberId) return json({ error: 'Member ID is required.' }, 400);

  const member = await context.env.DB.prepare('select id, email, name from users where id = ? limit 1').bind(memberId).first();
  if (!member) return json({ error: 'Member not found.' }, 404);
  if (action === 'delete-member') {
    if (member.id === auth.user.id) return json({ error: 'You cannot delete your own admin account while logged in.' }, 400);
    if (String(input.confirm || '').toUpperCase() !== 'DELETE') return json({ error: 'Type DELETE to confirm member deletion.' }, 400);
    await deleteMemberData(context.env, memberId);
    await logAdminAction(context.env, auth, 'delete-member', null, { deletedUserId: memberId, deletedEmail: member.email });
    return json({ ok: true, deleted: true });
  }
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
    const reset = await createPasswordReset(context.env, member.id, member.email, context.request);
    const emailSent = !!(reset.emailResult && reset.emailResult.sent);
    const emailReason = reset.emailResult && reset.emailResult.reason || '';
    await logAdminAction(context.env, auth, 'send-password-reset', memberId, { email: member.email, emailSent, emailReason });
    return json({ ok: true, resetUrl: reset.url, expiresInMinutes: 60, emailSent, emailReason });
  }
  if (action === 'clear-progress') {
    await context.env.DB.prepare('delete from lesson_progress where user_id = ?').bind(memberId).run();
    await context.env.DB.prepare('delete from readiness_signals where user_id = ?').bind(memberId).run();
    await context.env.DB.prepare('delete from resume_locations where user_id = ?').bind(memberId).run();
    await logAdminAction(context.env, auth, 'clear-progress', memberId, {});
    return json({ ok: true });
  }

  if (action === 'unlock-readiness') {
    await adminUnlockReadiness(context.env, auth, memberId);
    await logAdminAction(context.env, auth, 'unlock-readiness', memberId, { email: member.email });
    return json({ ok: true });
  }

  if (action === 'lock-readiness') {
    const message = cleanLimited(input.message, 600) || 'Advanced sections require admin review before they reopen.';
    await adminRequireReadinessReview(context.env, memberId, message);
    await logAdminAction(context.env, auth, 'lock-readiness', memberId, { email: member.email, message });
    return json({ ok: true });
  }

  if (action === 'send-email') {
    const subject = cleanLimited(input.subject, 180);
    const message = cleanLimited(input.message, 8000);
    const template = cleanLimited(input.template, 120).toLowerCase();
    if (!subject) return json({ error: 'Email subject is required.' }, 400);
    if (!message) return json({ error: 'Email message is required.' }, 400);
    const result = await sendAdminEmail(context.env, member.email, subject, message, auth.user.email);
    if (!result.sent) return json({ error: `Email was not sent: ${result.reason || 'email provider unavailable'}` }, 503);
    if (template === 'potential-affiliate-full-access') {
      await context.env.DB.prepare(
        `insert into memberships (user_id, status, current_period_end, plan, created_at, updated_at)
         values (?, 'lifetime', null, 'potential_affiliate', datetime('now'), datetime('now'))
         on conflict(user_id) do update set status = 'lifetime', current_period_end = null, plan = 'potential_affiliate', updated_at = datetime('now')`
      ).bind(memberId).run();
      await context.env.DB.prepare(
        `insert into admin_notes (id, user_id, admin_email, note, created_at)
         values (?, ?, ?, ?, datetime('now'))`
      ).bind(
        crypto.randomUUID(),
        memberId,
        auth.user.email,
        'Potential affiliate: full platform access granted after affiliate invitation email was sent.'
      ).run();
      await logAdminAction(context.env, auth, 'grant-potential-affiliate-access', memberId, { plan: 'potential_affiliate', status: 'lifetime' });
    }
    await logAdminAction(context.env, auth, 'send-email', memberId, { to: member.email, subject, template });
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
