-- ExpertFolio RLS: allow inserts with explicit tenant_id/product; keep selection strict.

-- Assessments insert policy
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='assessments') then
    if exists (select 1 from pg_policies where schemaname='public' and tablename='assessments' and polname='ef_assessments_insert') then
      drop policy ef_assessments_insert on public.assessments;
    end if;
    create policy ef_assessments_insert on public.assessments
      for insert with check (
        tenant_id is not null and product = 'folio'
      );
  end if;
exception when others then
  raise notice 'ef assessments insert policy skipped: %', sqlerrm;
end $$;

-- Evaluations insert policy
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='evaluations') then
    if exists (select 1 from pg_policies where schemaname='public' and tablename='evaluations' and polname='ef_evaluations_insert') then
      drop policy ef_evaluations_insert on public.evaluations;
    end if;
    create policy ef_evaluations_insert on public.evaluations
      for insert with check (
        tenant_id is not null and product = 'folio'
      );
  end if;
exception when others then
  raise notice 'ef evaluations insert policy skipped: %', sqlerrm;
end $$;


