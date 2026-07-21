-- Style AI — sharing + body-progress tracking

-- ── analyses ────────────────────────────────────────────────────
-- Public-shareable snapshot of a completed analysis. Separate from
-- style_reports (the private per-user history): a row here is what
-- gets rendered at /share/[id], readable by anyone while is_public.
create table if not exists public.analyses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete cascade,
  results    jsonb not null,
  is_public  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.analyses enable row level security;

create policy "analyses_select_public"
  on public.analyses for select
  using (is_public = true);

create policy "analyses_select_own"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "analyses_insert_own"
  on public.analyses for insert
  with check (auth.uid() = user_id);

-- Link a style_reports row to its public share snapshot, if any.
alter table public.style_reports
  add column if not exists analysis_id uuid references public.analyses (id) on delete set null;

-- ── progress_entries ────────────────────────────────────────────
create table if not exists public.progress_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  peso            numeric,
  grasa_corporal  numeric,
  grasa_visceral  numeric,
  created_at      timestamptz not null default now()
);

create index if not exists progress_entries_user_id_created_at_idx
  on public.progress_entries (user_id, created_at asc);

alter table public.progress_entries enable row level security;

create policy "progress_entries_select_own"
  on public.progress_entries for select
  using (auth.uid() = user_id);

create policy "progress_entries_insert_own"
  on public.progress_entries for insert
  with check (auth.uid() = user_id);

create policy "progress_entries_delete_own"
  on public.progress_entries for delete
  using (auth.uid() = user_id);
