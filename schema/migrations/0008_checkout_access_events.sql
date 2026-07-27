create table if not exists checkout_access_events (
  session_id text primary key,
  user_id text references users(id) on delete set null,
  status text not null default 'processing',
  attempts integer not null default 1,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now')),
  completed_at text
);
