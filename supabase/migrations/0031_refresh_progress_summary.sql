-- Refresh policy and helper for user_course_progress_summary materialized view
do $$ begin
  if not exists (
    select 1 from information_schema.tables where table_schema = 'public' and table_name = 'user_course_progress_summary'
  ) then
    raise notice 'user_course_progress_summary missing; skipping refresh helper';
  else
    -- Create a simple function to refresh the MV
    create or replace function public.refresh_user_course_progress_summary() returns void as $$
    begin
      refresh materialized view concurrently public.user_course_progress_summary;
    exception when others then
      -- Fallback to non-concurrent refresh if index is missing or lock contention occurs
      begin
        refresh materialized view public.user_course_progress_summary;
      exception when others then
        -- swallow errors to avoid failing migrations on older Postgres
        null;
      end;
    end;
    $$ language plpgsql security definer;
  end if;
end $$;


