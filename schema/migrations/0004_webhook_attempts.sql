alter table stripe_webhook_events add column attempts integer not null default 1;
