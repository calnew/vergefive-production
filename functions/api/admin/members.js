import { getAuth, isAdminUser, json } from '../../_lib/auth.js';

export async function onRequestGet(context) {
  const auth = context.data.auth || await getAuth(context.request, context.env);
  if (!auth || !await isAdminUser(auth.user.email, context.env)) return json({ error: 'Admin access required.' }, 403);

  const rows = await context.env.DB.prepare(
    `select
      u.id,
      u.email,
      u.name,
      u.created_at,
      u.last_login_at,
      u.email_verified_at,
      u.stripe_customer_id,
      coalesce(m.status, 'none') as membership_status,
      m.current_period_end,
      count(distinct lp.page_path) as progress_pages,
      count(distinct rs.signal_type) as signal_groups,
      count(distinct rp.id) as reports
    from users u
    left join memberships m on m.user_id = u.id
    left join lesson_progress lp on lp.user_id = u.id
    left join readiness_signals rs on rs.user_id = u.id
    left join report_snapshots rp on rp.user_id = u.id
    group by u.id
    order by u.created_at desc
    limit 500`
  ).all();

  const totals = await context.env.DB.prepare(
    `select
      count(*) as total_users,
      sum(case when email_verified_at is not null then 1 else 0 end) as verified_users,
      sum(case when m.status in ('active','trialing','trial','paid','lifetime') then 1 else 0 end) as active_members
    from users u
    left join memberships m on m.user_id = u.id`
  ).first();

  return json({ totals, members: rows.results || [] });
}
