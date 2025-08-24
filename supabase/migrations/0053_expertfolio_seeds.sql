-- Idempotent seeds for ExpertFolio (one program, two EPAs, mapping)
-- Uses fixed UUIDs and ON CONFLICT to avoid duplicates.

-- Constants
-- tenant: aaaaaaaaaaaa...
-- program: 1111...
-- epa1: 2222...
-- epa2: 3333...
-- map rows: 4444..., 5555...

insert into public.programs (id, tenant_id, product, title, description)
values (
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'folio',
  'Sample Program',
  'Seeded sample program for ExpertFolio')
on conflict (id) do nothing;

insert into public.epa (id, tenant_id, product, code, title, description)
values
('22222222-2222-2222-2222-222222222222','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','folio','EPA-1','EPA One','Seed EPA 1'),
('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','folio','EPA-2','EPA Two','Seed EPA 2')
on conflict (id) do nothing;

insert into public.program_epa_map (id, tenant_id, product, program_id, epa_id, sub_epa_id)
values
('44444444-4444-4444-4444-444444444444','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','folio','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222', null),
('55555555-5555-5555-5555-555555555555','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','folio','11111111-1111-1111-1111-111111111111','33333333-3333-3333-3333-333333333333', null)
on conflict (id) do nothing;


