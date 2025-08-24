create table if not exists idempotency_keys (
  tenant_id uuid not null,
  product text not null,
  user_id uuid not null,
  endpoint text not null,
  key text not null,
  response_json jsonb not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, product, user_id, endpoint, key)
);
alter table idempotency_keys enable row level security;
create policy idempotency_ins on idempotency_keys for insert to authenticated with check (true);
create policy idempotency_sel on idempotency_keys for select to authenticated using (true);


