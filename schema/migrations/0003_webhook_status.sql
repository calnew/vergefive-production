alter table stripe_webhook_events add column status text not null default 'completed';
