import { getAuth, isAdminUser, json, readJson, requireSameOrigin } from '../../_lib/auth.js';
import { createAffiliate, markCommissionPaid, normalizeAffiliateCode } from '../../_lib/affiliates.js';

async function requireAdmin(context) {
  const auth = context.data.auth || await getAuth(context.request, context.env);
  return auth && await isAdminUser(auth.user.email, context.env) ? auth : null;
}

export async function onRequestGet(context) {
  const auth = await requireAdmin(context);
  if (!auth) return json({ error: 'Admin access required.' }, 403);

  const affiliates = await context.env.DB.prepare(
    `select
      a.*,
      count(distinct r.id) as referral_count,
      count(distinct c.id) as commission_count,
      sum(case when c.status = 'payable' then c.amount_cents else 0 end) as payable_cents,
      sum(case when c.status = 'paid' then c.amount_cents else 0 end) as paid_cents
     from affiliates a
     left join affiliate_referrals r on r.affiliate_id = a.id
     left join affiliate_commissions c on c.affiliate_id = a.id
     group by a.id
     order by a.created_at desc`
  ).all();

  const commissions = await context.env.DB.prepare(
    `select
      c.*,
      a.code as affiliate_code,
      a.name as affiliate_name,
      u.email as member_email,
      u.name as member_name
     from affiliate_commissions c
     join affiliates a on a.id = c.affiliate_id
     join users u on u.id = c.user_id
     order by c.created_at desc
     limit 500`
  ).all();

  return json({ affiliates: affiliates.results || [], commissions: commissions.results || [] });
}

export async function onRequestPost(context) {
  const originError = requireSameOrigin(context);
  if (originError) return originError;
  const auth = await requireAdmin(context);
  if (!auth) return json({ error: 'Admin access required.' }, 403);
  const input = await readJson(context.request).catch(() => ({}));
  const action = String(input.action || 'create').toLowerCase();

  if (action === 'mark-paid') {
    const id = String(input.commissionId || '').trim();
    if (!id) return json({ error: 'Commission ID is required.' }, 400);
    await markCommissionPaid(context.env, id);
    return json({ ok: true });
  }

  const code = normalizeAffiliateCode(input.code);
  const affiliate = await createAffiliate(context.env, {
    code,
    name: input.name,
    email: input.email
  });
  if (affiliate instanceof Response) return affiliate;
  return json({ ok: true, affiliate });
}
