import { cleanLimited, getAuth, isAdminEmail, json, normalizeEmail, readJson, requireSameOrigin } from '../../_lib/auth.js';
import { ensureAdminSchema, logAdminAction } from '../../_lib/admin.js';
import { sendAdminEmail } from '../../_lib/security.js';

const DEFAULT_SUBJECT = 'Is [Phone Number] still attached to your business?';
const DEFAULT_MESSAGE = `Hi [First Name],

I was looking back through the old Verge Five records and saw this phone number connected to your business:

[Phone Number]

Is this number still attached to the business?

I am asking because the business credit game has changed. AI, automation, and data-matching systems are now involved in how vendors, lenders, credit card issuers, and funding platforms review a business.

That means the basic business visibility signals matter more than ever:

- Does the business phone still connect to the business?
- Does the address match public records?
- Does the website still exist?
- Does the business name show up consistently?
- Do the public records make the business look active and legitimate?

If any of those signals are missing, outdated, or inconsistent, the business can look weak before an application ever gets reviewed.

I am not sure if this business is still active, but if it is, you may want to run a quick Business Visibility Scan inside the updated Verge Five platform and see what your business profile looks like now.

The updated platform was rebuilt around the data points that automated systems and AI-assisted reviews look at before business credit, vendor credit, credit cards, or funding decisions are made.

No pressure. I am extending this because you were part of the previous Verge Five platform.

It is free to run the scan and take the 30-day test drive. See what the system finds, look around the updated platform, and decide whether the new Verge Five is a good fit for where your business is now.

Run the visibility scan:
[Test Drive Link]

Verge Five team`;
const OLD_DEFAULT_SUBJECTS = ['Your Verge Five test drive is ready', 'Is your business still showing up correctly?'];
const OLD_DEFAULT_MARKERS = [
  'The new Verge Five platform is live, and I wanted to give you a direct way to see what has changed.',
  'You were part of the original Verge Five',
  'Is this still the main business number for your company?'
];

async function requireAdmin(context) {
  const auth = context.data.auth || await getAuth(context.request, context.env);
  return auth && isAdminEmail(auth.user.email, context.env) ? auth : null;
}

function splitCsvLine(line) {
  const out = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      out.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  out.push(current.trim());
  return out;
}

function parseContacts(text) {
  return String(text || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = splitCsvLine(line);
    if (parts.length === 1) return { email: normalizeEmail(parts[0]) };
    if (parts.length === 2) return { firstName: cleanLimited(parts[0], 80), email: normalizeEmail(parts[1]) };
    return { firstName: cleanLimited(parts[0], 80), lastName: cleanLimited(parts[1], 80), email: normalizeEmail(parts[2]), phone: cleanLimited(parts[3] || '', 40) };
  }).filter((item) => item.email && item.email.includes('@'));
}

function testDriveUrl(context, token) {
  const origin = String(context.env.SITE_URL || '') || new URL(context.request.url).origin;
  return `${origin}/api/legacy/track?token=${encodeURIComponent(token)}`;
}

function personalize(message, lead, link) {
  const firstName = lead.first_name || lead.firstName || 'there';
  const phone = lead.phone || 'the number we have on file';
  return String(message || DEFAULT_MESSAGE)
    .replace(/\[First Name\]/g, firstName)
    .replace(/\[Phone Number\]/g, phone)
    .replace(/\[Test Drive Link\]/g, link);
}

async function loadDashboard(env) {
  await ensureAdminSchema(env);
  const campaigns = await env.DB.prepare(
    `select c.*,
      count(l.id) as total_leads,
      sum(case when l.email_sent_at is not null then 1 else 0 end) as sent_count,
      sum(case when l.clicked_at is not null then 1 else 0 end) as clicked_count,
      sum(case when l.registered_at is not null then 1 else 0 end) as registered_count
     from legacy_campaigns c
     left join legacy_leads l on l.campaign_id = c.id
     group by c.id
     order by c.created_at desc`
  ).all();
  let campaignId = campaigns.results && campaigns.results[0] && campaigns.results[0].id || '';
  if (!campaignId) {
    campaignId = crypto.randomUUID();
    await env.DB.prepare(
      `insert into legacy_campaigns (id, name, subject, message, created_at, updated_at)
       values (?, 'Legacy Verge Five clients', ?, ?, datetime('now'), datetime('now'))`
    ).bind(campaignId, DEFAULT_SUBJECT, DEFAULT_MESSAGE).run();
    return loadDashboard(env);
  }
  const activeCampaign = campaigns.results && campaigns.results[0];
  if (activeCampaign && OLD_DEFAULT_SUBJECTS.includes(activeCampaign.subject) && OLD_DEFAULT_MARKERS.some((marker) => String(activeCampaign.message || '').includes(marker))) {
    await env.DB.prepare(
      `update legacy_campaigns set subject = ?, message = ?, updated_at = datetime('now') where id = ?`
    ).bind(DEFAULT_SUBJECT, DEFAULT_MESSAGE, activeCampaign.id).run();
    return loadDashboard(env);
  }
  const leads = await env.DB.prepare(
    `select l.*, u.email as member_email
     from legacy_leads l
     left join users u on u.id = l.user_id
     where l.campaign_id = ?
     order by l.created_at desc
     limit 1000`
  ).bind(campaignId).all();
  return {
    campaigns: campaigns.results || [],
    activeCampaignId: campaignId,
    leads: leads.results || []
  };
}

export async function onRequestGet(context) {
  const auth = context.data.auth || await requireAdmin(context);
  if (!auth) return json({ error: 'Admin access required.' }, 403);
  return json(await loadDashboard(context.env));
}

export async function onRequestPost(context) {
  const originError = requireSameOrigin(context);
  if (originError) return originError;
  const auth = await requireAdmin(context);
  if (!auth) return json({ error: 'Admin access required.' }, 403);
  await ensureAdminSchema(context.env);
  const input = await readJson(context.request, 80 * 1024).catch(() => ({}));
  const action = String(input.action || '').toLowerCase();

  if (action === 'save-campaign') {
    const campaignId = cleanLimited(input.campaignId, 80) || crypto.randomUUID();
    const name = cleanLimited(input.name, 160) || 'Legacy Verge Five clients';
    const subject = cleanLimited(input.subject, 180) || DEFAULT_SUBJECT;
    const message = String(input.message || DEFAULT_MESSAGE).trim().slice(0, 8000) || DEFAULT_MESSAGE;
    await context.env.DB.prepare(
      `insert into legacy_campaigns (id, name, subject, message, created_at, updated_at)
       values (?, ?, ?, ?, datetime('now'), datetime('now'))
       on conflict(id) do update set name = excluded.name, subject = excluded.subject, message = excluded.message, updated_at = datetime('now')`
    ).bind(campaignId, name, subject, message).run();
    await logAdminAction(context.env, auth, 'save-legacy-campaign', null, { campaignId, name });
    return json({ ok: true, campaignId });
  }

  if (action === 'import-leads') {
    const campaignId = cleanLimited(input.campaignId, 80);
    if (!campaignId) return json({ error: 'Campaign is required.' }, 400);
    const source = cleanLimited(input.source || 'Previous Verge Five platform', 160);
    const contacts = parseContacts(input.contacts).slice(0, 500);
    if (!contacts.length) return json({ error: 'Paste at least one valid contact row.' }, 400);
    let imported = 0;
    let skipped = 0;
    for (const contact of contacts) {
      const exists = await context.env.DB.prepare('select id from legacy_leads where campaign_id = ? and email = ? limit 1').bind(campaignId, contact.email).first();
      if (exists) {
        skipped += 1;
        continue;
      }
      await context.env.DB.prepare(
        `insert into legacy_leads (id, campaign_id, first_name, last_name, email, phone, source, token, status, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, 'imported', datetime('now'), datetime('now'))`
      ).bind(crypto.randomUUID(), campaignId, contact.firstName || '', contact.lastName || '', contact.email, contact.phone || '', source, crypto.randomUUID()).run();
      imported += 1;
    }
    await logAdminAction(context.env, auth, 'import-legacy-leads', null, { campaignId, imported, skipped, source });
    return json({ ok: true, imported, skipped });
  }

  if (action === 'send-campaign') {
    const campaignId = cleanLimited(input.campaignId, 80);
    const mode = cleanLimited(input.mode || 'selected', 40);
    const selectedIds = Array.isArray(input.leadIds) ? input.leadIds.map((id) => cleanLimited(id, 80)).filter(Boolean).slice(0, 100) : [];
    const campaign = await context.env.DB.prepare('select * from legacy_campaigns where id = ? limit 1').bind(campaignId).first();
    if (!campaign) return json({ error: 'Campaign not found.' }, 404);
    let leads;
    if (mode === 'next-unsent') {
      leads = await context.env.DB.prepare(
        `select * from legacy_leads where campaign_id = ? and email_sent_at is null and registered_at is null and do_not_contact = 0 order by created_at asc limit 100`
      ).bind(campaignId).all();
    } else {
      if (!selectedIds.length) return json({ error: 'Select at least one contact.' }, 400);
      const placeholders = selectedIds.map(() => '?').join(',');
      leads = await context.env.DB.prepare(
        `select * from legacy_leads where campaign_id = ? and id in (${placeholders}) and registered_at is null and do_not_contact = 0 limit 100`
      ).bind(campaignId, ...selectedIds).all();
    }
    const rows = leads.results || [];
    let sent = 0;
    let failed = 0;
    const errors = [];
    const sentIds = [];
    for (const lead of rows) {
      const link = testDriveUrl(context, lead.token);
      const result = await sendAdminEmail(context.env, lead.email, personalize(campaign.subject, lead, link), personalize(campaign.message, lead, link), auth.user.email);
      if (result.sent) {
        sent += 1;
        if (result.id) sentIds.push(`${lead.email}: ${result.id}`.slice(0, 220));
        await context.env.DB.prepare(
          `update legacy_leads
           set email_sent_at = datetime('now'),
               email_send_count = email_send_count + 1,
               email_last_provider_id = ?,
               email_last_result = ?,
               status = case when status = 'imported' then 'sent' else status end,
               updated_at = datetime('now')
           where id = ?`
        ).bind(result.id || '', `accepted ${result.status || ''}`.trim(), lead.id).run();
      } else {
        failed += 1;
        const reason = result.reason || 'not sent';
        await context.env.DB.prepare(
          `update legacy_leads set email_last_result = ?, updated_at = datetime('now') where id = ?`
        ).bind(reason.slice(0, 500), lead.id).run();
        errors.push(`${lead.email}: ${reason}`.slice(0, 220));
      }
    }
    await logAdminAction(context.env, auth, 'send-legacy-campaign', null, { campaignId, sent, failed, sentIds: sentIds.slice(0, 10) });
    return json({ ok: true, sent, failed, errors: errors.slice(0, 10), sentIds: sentIds.slice(0, 10) });
  }

  if (action === 'delete-lead') {
    const leadId = cleanLimited(input.leadId, 80);
    await context.env.DB.prepare('delete from legacy_leads where id = ? and registered_at is null').bind(leadId).run();
    await logAdminAction(context.env, auth, 'delete-legacy-lead', null, { leadId });
    return json({ ok: true });
  }

  if (action === 'do-not-contact') {
    const leadId = cleanLimited(input.leadId, 80);
    await context.env.DB.prepare(`update legacy_leads set do_not_contact = 1, status = 'do_not_contact', updated_at = datetime('now') where id = ?`).bind(leadId).run();
    await logAdminAction(context.env, auth, 'legacy-do-not-contact', null, { leadId });
    return json({ ok: true });
  }

  return json({ error: 'Unsupported legacy campaign action.' }, 400);
}
