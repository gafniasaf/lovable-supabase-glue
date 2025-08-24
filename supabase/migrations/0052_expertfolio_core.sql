-- ExpertFolio core tables (additive). Deny-by-default RLS with tenant/product isolation.

create type public.product_t as enum ('edu','folio');

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  product public.product_t not null default 'folio',
  title text not null,
  description text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.epa (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  product public.product_t not null default 'folio',
  code text not null,
  title text not null,
  description text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sub_epa (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  product public.product_t not null default 'folio',
  epa_id uuid not null references public.epa(id) on delete cascade,
  code text not null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.program_epa_map (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  product public.product_t not null default 'folio',
  program_id uuid not null references public.programs(id) on delete cascade,
  epa_id uuid not null references public.epa(id) on delete cascade,
  sub_epa_id uuid null references public.sub_epa(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  product public.product_t not null default 'folio',
  program_id uuid not null references public.programs(id) on delete cascade,
  trainee_id uuid not null,
  supervisor_id uuid not null,
  epa_id uuid not null references public.epa(id) on delete restrict,
  sub_epa_id uuid null references public.sub_epa(id) on delete set null,
  body text null,
  submitted_at timestamptz not null default now()
);

create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  product public.product_t not null default 'folio',
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  evaluator_id uuid not null,
  outcome text not null check (outcome in ('approved','rejected','needs_changes')),
  comments text null,
  created_at timestamptz not null default now()
);

create table if not exists public.competency_levels (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  product public.product_t not null default 'folio',
  program_id uuid not null references public.programs(id) on delete cascade,
  trainee_id uuid not null,
  epa_id uuid not null references public.epa(id) on delete restrict,
  level int not null check (level between 1 and 5),
  observed_at timestamptz not null default now()
);

-- Indexes for tenancy and lookups
create index if not exists idx_programs_tenant_product on public.programs(tenant_id, product);
create index if not exists idx_epa_tenant_product on public.epa(tenant_id, product);
create index if not exists idx_subepa_tenant_product on public.sub_epa(tenant_id, product);
create index if not exists idx_map_tenant_product on public.program_epa_map(tenant_id, product);
create index if not exists idx_assess_tenant_product on public.assessments(tenant_id, product);
create index if not exists idx_eval_tenant_product on public.evaluations(tenant_id, product);
create index if not exists idx_comp_tenant_product on public.competency_levels(tenant_id, product);

-- RLS enable
alter table public.programs enable row level security;
alter table public.epa enable row level security;
alter table public.sub_epa enable row level security;
alter table public.program_epa_map enable row level security;
alter table public.assessments enable row level security;
alter table public.evaluations enable row level security;
alter table public.competency_levels enable row level security;

-- Deny-by-default (no permissive policy)
-- Isolation policies by tenant_id and product; app-layer determines user role.
create policy ef_programs_tenant_isolation on public.programs for all to authenticated using (false) with check (false);
create policy ef_epa_tenant_isolation on public.epa for all to authenticated using (false) with check (false);
create policy ef_subepa_tenant_isolation on public.sub_epa for all to authenticated using (false) with check (false);
create policy ef_map_tenant_isolation on public.program_epa_map for all to authenticated using (false) with check (false);
create policy ef_assess_tenant_isolation on public.assessments for all to authenticated using (false) with check (false);
create policy ef_eval_tenant_isolation on public.evaluations for all to authenticated using (false) with check (false);
create policy ef_comp_tenant_isolation on public.competency_levels for all to authenticated using (false) with check (false);


