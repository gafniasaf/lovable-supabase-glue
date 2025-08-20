-- Materialized view for per-user per-course progress aggregates
create materialized view if not exists public.user_course_progress_summary as
select p.user_id, l.course_id, count(*)::int as completed_lessons
from public.progress p
join public.lessons l on l.id = p.lesson_id
group by p.user_id, l.course_id;

-- Indexes for fast lookups
create index if not exists idx_user_course_progress_user on public.user_course_progress_summary(user_id);
create index if not exists idx_user_course_progress_user_course on public.user_course_progress_summary(user_id, course_id);


