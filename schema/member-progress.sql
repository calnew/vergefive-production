-- Verge Five member progress database schema for Cloudflare D1.
-- This schema stores progress and reports without storing proprietary lesson content.

create table if not exists users (
  id text primary key,
  email text not null unique,
  name text,
  auth_provider text,
  password_hash text,
  password_salt text,
  password_iterations integer,
  stripe_customer_id text,
  referred_by_affiliate_id text,
  affiliate_referral_code text,
  email_verified_at text,
  created_at text not null default (datetime('now')),
  last_login_at text
);

create table if not exists email_verification_tokens (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  token text not null unique,
  email text not null,
  expires_at text not null,
  consumed_at text,
  created_at text not null default (datetime('now'))
);

create table if not exists password_reset_tokens (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  token text not null unique,
  email text not null,
  expires_at text not null,
  consumed_at text,
  created_at text not null default (datetime('now'))
);
create table if not exists sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at text not null,
  created_at text not null default (datetime('now'))
);

create table if not exists memberships (
  user_id text primary key references users(id) on delete cascade,
  status text not null default 'pending',
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  plan text,
  current_period_end text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists affiliates (
  id text primary key,
  code text not null unique,
  name text not null,
  email text,
  status text not null default 'active',
  commission_amount_cents integer not null default 6000,
  monthly_qualifying_payments integer not null default 3,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists affiliate_referrals (
  id text primary key,
  affiliate_id text not null references affiliates(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  referral_code text not null,
  landing_path text,
  signup_path text,
  created_at text not null default (datetime('now')),
  unique(user_id)
);

create table if not exists affiliate_commissions (
  id text primary key,
  affiliate_id text not null references affiliates(id) on delete cascade,
  referral_id text not null references affiliate_referrals(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  plan text not null,
  amount_cents integer not null default 6000,
  currency text not null default 'usd',
  status text not null default 'pending',
  qualifying_payments_required integer not null default 1,
  qualifying_payments_count integer not null default 0,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_checkout_session_id text,
  eligible_at text,
  paid_at text,
  notes text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now')),
  unique(referral_id, plan)
);

create table if not exists affiliate_invoice_events (
  stripe_invoice_id text primary key,
  commission_id text not null references affiliate_commissions(id) on delete cascade,
  created_at text not null default (datetime('now'))
);

create table if not exists stripe_webhook_events (
  id text primary key,
  event_type text,
  created_at text not null default (datetime('now'))
);

create table if not exists rate_limits (
  bucket text primary key,
  count integer not null default 0,
  reset_at text not null,
  updated_at text not null default (datetime('now'))
);
create table if not exists business_profiles (
  user_id text primary key references users(id) on delete cascade,
  business_name text,
  trade_name text,
  entity_type text,
  formation_state text,
  ein text,
  industry text,
  phone text,
  address text,
  website text,
  email text,
  bank integer not null default 0,
  directory_411 integer not null default 0,
  bureau_profile integer not null default 0,
  vendor_tradelines integer not null default 0,
  funding_reserve integer not null default 0,
  updated_at text not null default (datetime('now'))
);

create table if not exists lesson_progress (
  user_id text not null references users(id) on delete cascade,
  page_path text not null,
  completed_indexes text not null default '[]',
  last_opened_at text not null default (datetime('now')),
  primary key (user_id, page_path)
);

create table if not exists readiness_signals (
  user_id text not null references users(id) on delete cascade,
  signal_type text not null,
  selected_keys text not null default '[]',
  updated_at text not null default (datetime('now')),
  primary key (user_id, signal_type)
);

create table if not exists resume_locations (
  user_id text primary key references users(id) on delete cascade,
  page_path text not null,
  page_title text,
  breadcrumb text,
  updated_at text not null default (datetime('now'))
);

create table if not exists report_snapshots (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  report_type text not null,
  readiness_stage text,
  summary_json text not null,
  created_at text not null default (datetime('now'))
);

create table if not exists visibility_audits (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  mode text not null,
  business_name text,
  score integer,
  label text,
  source_mode text,
  engine text,
  result_json text not null,
  created_at text not null default (datetime('now'))
);

create table if not exists member_access_events (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  page_path text not null,
  event_type text not null default 'page_view',
  created_at text not null default (datetime('now'))
);

create table if not exists member_readiness_locks (
  user_id text primary key references users(id) on delete cascade,
  status text not null default 'clear',
  reason text,
  message text,
  flagged_at text,
  unlock_after text,
  admin_unlocked_at text,
  admin_unlocked_by text,
  updated_at text not null default (datetime('now'))
);

create table if not exists member_preferences (
  user_id text not null references users(id) on delete cascade,
  preference_key text not null,
  preference_value text not null,
  updated_at text not null default (datetime('now')),
  primary key (user_id, preference_key)
);

create table if not exists legacy_campaigns (
  id text primary key,
  name text not null,
  subject text not null,
  message text not null,
  preview_text text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists legacy_leads (
  id text primary key,
  campaign_id text not null references legacy_campaigns(id) on delete cascade,
  first_name text,
  last_name text,
  business_name text,
  email text not null,
  phone text,
  source text,
  status text not null default 'imported',
  token text not null unique,
  email_sent_at text,
  email_send_count integer not null default 0,
  email_last_provider_id text,
  email_last_result text,
  clicked_at text,
  click_count integer not null default 0,
  registered_at text,
  user_id text references users(id) on delete set null,
  do_not_contact integer not null default 0,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists support_requests (
  id text primary key,
  user_id text references users(id) on delete set null,
  type text,
  severity text,
  name text,
  email text,
  page_url text,
  message text,
  steps text,
  browser text,
  source text,
  fix_key text,
  selected_option text,
  status text not null default 'new',
  created_at text not null default (datetime('now'))
);

create index if not exists idx_lesson_progress_user on lesson_progress(user_id);
create index if not exists idx_readiness_signals_user on readiness_signals(user_id);
create index if not exists idx_report_snapshots_user on report_snapshots(user_id, created_at);
create index if not exists idx_visibility_audits_user on visibility_audits(user_id, mode, created_at);
create index if not exists idx_member_access_events_user_time on member_access_events(user_id, created_at);
create index if not exists idx_member_readiness_locks_status on member_readiness_locks(status, unlock_after);
create index if not exists idx_support_requests_created on support_requests(created_at);
create index if not exists idx_support_requests_user on support_requests(user_id, created_at);
create index if not exists idx_sessions_token_hash on sessions(token_hash);
create index if not exists idx_sessions_user on sessions(user_id);
create index if not exists idx_users_stripe_customer on users(stripe_customer_id);
create index if not exists idx_email_verification_token on email_verification_tokens(token);
create index if not exists idx_password_reset_token on password_reset_tokens(token);
create index if not exists idx_affiliates_code on affiliates(code);
create index if not exists idx_affiliate_referrals_affiliate on affiliate_referrals(affiliate_id);
create index if not exists idx_affiliate_referrals_user on affiliate_referrals(user_id);
create index if not exists idx_affiliate_commissions_affiliate on affiliate_commissions(affiliate_id, status);
create index if not exists idx_affiliate_commissions_subscription on affiliate_commissions(stripe_subscription_id);

create index if not exists idx_rate_limits_reset on rate_limits(reset_at);
create index if not exists idx_legacy_leads_campaign on legacy_leads(campaign_id, created_at);
create index if not exists idx_legacy_leads_email on legacy_leads(email);
create index if not exists idx_legacy_leads_status on legacy_leads(status);
create index if not exists idx_legacy_leads_token on legacy_leads(token);

create table if not exists admin_notes (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  admin_email text,
  note text not null,
  created_at text not null default (datetime('now'))
);

create table if not exists admin_activity_log (
  id text primary key,
  admin_email text,
  user_id text references users(id) on delete set null,
  action text not null,
  details text,
  created_at text not null default (datetime('now'))
);

create index if not exists idx_admin_notes_user on admin_notes(user_id, created_at);
create index if not exists idx_admin_activity_user on admin_activity_log(user_id, created_at);
create index if not exists idx_admin_activity_admin on admin_activity_log(admin_email, created_at);
