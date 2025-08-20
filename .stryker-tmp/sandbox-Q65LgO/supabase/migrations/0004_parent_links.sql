-- Parent links table to associate parents with students
create table if not exists public.parent_links (
	id uuid primary key default gen_random_uuid(),
	parent_id uuid not null,
	student_id uuid not null,
	created_at timestamptz not null default now(),
	unique(parent_id, student_id)
);

alter table public.parent_links enable row level security;

-- Policies (adjust to your org model). Minimal safe defaults:
-- Admins can do everything (assumes a future function or column to check admin role).
-- For now, allow authenticated users to select their own parent rows; restrict writes to admins in app layer.

-- Example permissive select for parents to read their links
drop policy if exists parent_links_parent_read on public.parent_links;
create policy parent_links_parent_read on public.parent_links
	for select
	to authenticated
	using (auth.uid() = parent_id);

-- Writes are controlled at the application layer (admins only)
-- You may add stricter RLS with definer-security stored procedures if needed.


