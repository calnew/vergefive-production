import { getAuth, isAdminEmail, json } from '../../_lib/auth.js';
import { ensureAdminSchema } from '../../_lib/admin.js';

function csvCell(value) {
  return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
}

export async function onRequestGet(context) {
  const auth = context.data.auth || await getAuth(context.request, context.env);
  if (!auth || !isAdminEmail(auth.user.email, context.env)) return json({ error: 'Admin access required.' }, 403);
  await ensureAdminSchema(context.env);
  const url = new URL(context.request.url);

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
      m.plan,
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

  const members = rows.results || [];
  if (url.searchParams.get('format') === 'csv') {
    const headers = ['name','email','membership_status','plan','created_at','last_login_at','verified','progress_pages','signal_groups','reports'];
    const lines = [headers.join(',')].concat(members.map((m) => headers.map((key) => {
      const value = key === 'verified' ? (m.email_verified_at ? 'yes' : 'no') : m[key];
      return csvCell(value);
    }).join(',')));
    return new Response(lines.join('\n'), {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename=verge-five-members.csv',
        'cache-control': 'no-store'
      }
    });
  }

  return json({ totals, members });
}
