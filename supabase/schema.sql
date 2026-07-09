-- Feature 23 (starter-tracker): sourdough_feedings table.
-- This table lives in the existing "Grocery List" Supabase project (shared
-- free-tier project, not a dedicated one — Supabase caps free projects at 2
-- per org and both existing slots were already in active use). The table
-- name is prefixed with `sourdough_` specifically to avoid any collision
-- with that project's own tables and to make ownership obvious when
-- browsing the table list. See context/tech-stack.md and
-- context/launch-plan.md for the scoped decision to bring Supabase in early.

create table if not exists sourdough_feedings (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  ratio smallint not null check (ratio between 1 and 5),
  starter_grams int null,
  flour_grams int null,
  water_grams int null,
  fed_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table sourdough_feedings enable row level security;

-- Permissive RLS by design, not by oversight: there is no Supabase Auth in
-- this app yet (Phase 4 in context/launch-plan.md is when auth arrives), so
-- there is no `auth.uid()` to check policies against. Filtering by email
-- happens application-side (lib/storage/feedings.ts), not at the DB layer.
-- This is acceptable for a single beta user during the open-beta phase, but
-- is NOT safe once multiple real users share this table — a malicious
-- client holding the anon key could read/write rows for any email. This
-- tradeoff is documented and accepted in specs/features/23-starter-tracker/tasks.md
-- (see "Risks"), and must be revisited before/at Phase 4 (real auth + RLS
-- scoped to auth.uid()).
create policy "sourdough_feedings_permissive_select" on sourdough_feedings
  for select to anon using (true);

create policy "sourdough_feedings_permissive_insert" on sourdough_feedings
  for insert to anon with check (true);

create policy "sourdough_feedings_permissive_update" on sourdough_feedings
  for update to anon using (true) with check (true);

create policy "sourdough_feedings_permissive_delete" on sourdough_feedings
  for delete to anon using (true);
