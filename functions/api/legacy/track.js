import { redirect } from '../../_lib/auth.js';
import { ensureAdminSchema } from '../../_lib/admin.js';

export async function onRequestGet(context) {
  await ensureAdminSchema(context.env);
  const url = new URL(context.request.url);
  const token = String(url.searchParams.get('token') || '').trim();
  if (token) {
    await context.env.DB.prepare(
      `update legacy_leads
       set clicked_at = coalesce(clicked_at, datetime('now')),
           click_count = click_count + 1,
           status = case when registered_at is not null then status else 'clicked' end,
           updated_at = datetime('now')
       where token = ?`
    ).bind(token).run();
  }
  const target = token
    ? `/signup/?trial=start&legacy=${encodeURIComponent(token)}`
    : '/signup/?trial=start';
  return redirect(target);
}
