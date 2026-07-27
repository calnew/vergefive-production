create table users (
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

create table memberships (
  user_id text primary key references users(id) on delete cascade,
  status text not null default 'pending',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table stripe_webhook_events (
  id text primary key,
  event_type text,
  created_at text not null default (datetime('now'))
);
