import { json } from './auth.js';

const COMMISSION_CENTS = 6000;
const MONTHLY_REQUIRED_PAYMENTS = 3;

export function normalizeAffiliateCode(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 48);
}

export async function getActiveAffiliateByCode(env, code) {
  const cleanCode = normalizeAffiliateCode(code);
  if (!cleanCode) return null;
  return await env.DB.prepare(
    `select * from affiliates
     where lower(code) = ? and status = 'active'
     limit 1`
  ).bind(cleanCode).first();
}

export async function createAffiliate(env, input) {
  const code = normalizeAffiliateCode(input.code);
  const name = String(input.name || '').trim();
  const email = String(input.email || '').trim().toLowerCase();
  if (!code) return json({ error: 'Affiliate code is required.' }, 400);
  if (!name) return json({ error: 'Affiliate name is required.' }, 400);
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `insert into affiliates
      (id, code, name, email, status, commission_amount_cents, monthly_qualifying_payments, created_at, updated_at)
     values (?, ?, ?, ?, 'active', ?, ?, datetime("now"), datetime("now"))`
  ).bind(id, code, name, email, COMMISSION_CENTS, MONTHLY_REQUIRED_PAYMENTS).run();
  return { id, code, name, email, status: 'active' };
}

export async function attachReferralToUser(env, userId, code, request) {
  const affiliate = await getActiveAffiliateByCode(env, code);
  if (!affiliate) return null;
  const id = crypto.randomUUID();
  const url = new URL(request.url);
  await env.DB.prepare(
    `insert into affiliate_referrals
      (id, affiliate_id, user_id, referral_code, landing_path, signup_path, created_at)
     values (?, ?, ?, ?, ?, ?, datetime("now"))
     on conflict(user_id) do nothing`
  ).bind(id, affiliate.id, userId, affiliate.code, '', url.pathname + url.search).run();
  await env.DB.prepare(
    `update users
     set referred_by_affiliate_id = coalesce(referred_by_affiliate_id, ?),
         affiliate_referral_code = coalesce(affiliate_referral_code, ?)
     where id = ?`
  ).bind(affiliate.id, affiliate.code, userId).run();
  return affiliate;
}

export async function referralForUser(env, userId) {
  if (!userId) return null;
  return await env.DB.prepare(
    `select r.*, a.commission_amount_cents, a.monthly_qualifying_payments
     from affiliate_referrals r
     join affiliates a on a.id = r.affiliate_id
     where r.user_id = ?
     limit 1`
  ).bind(userId).first();
}

export async function ensureCommissionForCheckout(env, session) {
  const userId = session.client_reference_id || (session.metadata && session.metadata.user_id);
  const plan = normalizePlan(session.metadata && session.metadata.plan);
  if (!userId || session.payment_status !== 'paid') return;
  const referral = await referralForUser(env, userId);
  if (!referral) return;
  const required = plan === 'monthly'
    ? Number(referral.monthly_qualifying_payments || MONTHLY_REQUIRED_PAYMENTS)
    : 1;
  const count = plan === 'monthly' ? 0 : 1;
  const status = plan === 'monthly' && count < required ? 'pending' : 'payable';
  const eligibleAt = status === 'payable' ? new Date().toISOString() : '';

  await env.DB.prepare(
    `insert into affiliate_commissions
      (id, affiliate_id, referral_id, user_id, plan, amount_cents, currency, status,
       qualifying_payments_required, qualifying_payments_count, stripe_customer_id,
       stripe_subscription_id, stripe_checkout_session_id, eligible_at, notes, created_at, updated_at)
     values (?, ?, ?, ?, ?, ?, 'usd', ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))
     on conflict(referral_id, plan) do update set
       stripe_customer_id = coalesce(nullif(excluded.stripe_customer_id, ''), affiliate_commissions.stripe_customer_id),
       stripe_subscription_id = coalesce(nullif(excluded.stripe_subscription_id, ''), affiliate_commissions.stripe_subscription_id),
       stripe_checkout_session_id = coalesce(nullif(excluded.stripe_checkout_session_id, ''), affiliate_commissions.stripe_checkout_session_id),
       qualifying_payments_count = max(affiliate_commissions.qualifying_payments_count, excluded.qualifying_payments_count),
       status = case
         when affiliate_commissions.status = 'paid' then affiliate_commissions.status
         when max(affiliate_commissions.qualifying_payments_count, excluded.qualifying_payments_count) >= affiliate_commissions.qualifying_payments_required then 'payable'
         else affiliate_commissions.status
       end,
       eligible_at = case
         when affiliate_commissions.eligible_at is not null and affiliate_commissions.eligible_at != '' then affiliate_commissions.eligible_at
         when max(affiliate_commissions.qualifying_payments_count, excluded.qualifying_payments_count) >= affiliate_commissions.qualifying_payments_required then datetime("now")
         else affiliate_commissions.eligible_at
       end,
       updated_at = datetime("now")`
  ).bind(
    crypto.randomUUID(),
    referral.affiliate_id,
    referral.id,
    userId,
    plan,
    Number(referral.commission_amount_cents || COMMISSION_CENTS),
    status,
    required,
    count,
    session.customer || '',
    session.subscription || '',
    session.id || '',
    eligibleAt,
    plan === 'monthly' ? 'Monthly commission becomes payable after 3 successful payments.' : 'Annual commission is $60 per paid annual signup.'
  ).run();
}

export async function recordPaidInvoice(env, invoice) {
  const invoiceId = invoice.id || '';
  const subscriptionId = invoice.subscription || '';
  if (!invoiceId || !subscriptionId) return;
  const commission = await env.DB.prepare(
    `select id from affiliate_commissions
     where stripe_subscription_id = ? and plan = 'monthly' and status != 'paid'
     limit 1`
  ).bind(subscriptionId).first();
  if (!commission) return;
  try {
    await env.DB.batch([
      env.DB.prepare(
        `insert into affiliate_invoice_events (stripe_invoice_id, commission_id, created_at)
         values (?, ?, datetime("now"))`,
      ).bind(invoiceId, commission.id),
      env.DB.prepare(
        `update affiliate_commissions
         set qualifying_payments_count = qualifying_payments_count + 1,
             status = case
               when qualifying_payments_count + 1 >= qualifying_payments_required then 'payable'
               else 'pending'
             end,
             eligible_at = case
               when qualifying_payments_count + 1 >= qualifying_payments_required
                 and coalesce(eligible_at, '') = ''
               then datetime("now")
               else eligible_at
             end,
             updated_at = datetime("now")
         where id = ?`,
      ).bind(commission.id),
    ]);
  } catch (error) {
    if (/unique constraint failed.*affiliate_invoice_events/i.test(String(error && error.message || error))) return;
    throw error;
  }
}

export async function markCommissionPaid(env, commissionId) {
  await env.DB.prepare(
    `update affiliate_commissions
     set status = 'paid', paid_at = datetime("now"), updated_at = datetime("now")
     where id = ? and status = 'payable'`
  ).bind(commissionId).run();
}

function normalizePlan(plan) {
  const value = String(plan || '').toLowerCase();
  return value === 'annual' || value === 'yearly' ? 'annual' : 'monthly';
}
