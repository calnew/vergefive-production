create table if not exists member_fix_status (
  user_id text not null references users(id) on delete cascade,
  fix_key text not null,
  status text not null default 'todo' check (status in ('todo', 'progress', 'done')),
  updated_at text not null default (datetime('now')),
  primary key (user_id, fix_key)
);

create index if not exists idx_member_fix_status_user on member_fix_status(user_id, status);
