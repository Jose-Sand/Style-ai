-- Style AI — initial schema
-- Run this in the Supabase SQL editor, or via `supabase db push` / `supabase migration up`.

-- ── Extensions ──────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── profiles ────────────────────────────────────────────────────
-- One row per auth.users row. Created automatically by the trigger below.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ── style_reports ───────────────────────────────────────────────
-- One row per analysis run. `input` holds the physical-data form,
-- `result` holds the parsed Claude JSON (the 5 report sections).
create table if not exists public.style_reports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  status       text not null default 'completed'
               check (status in ('pending', 'completed', 'failed')),
  input        jsonb not null default '{}'::jsonb,
  result       jsonb,
  summary      text,
  photo_paths  jsonb not null default '{}'::jsonb, -- { front: "userId/reportId/front.jpg", ... }
  error        text,
  created_at   timestamptz not null default now()
);

create index if not exists style_reports_user_id_created_at_idx
  on public.style_reports (user_id, created_at desc);

alter table public.style_reports enable row level security;

create policy "style_reports_select_own"
  on public.style_reports for select
  using (auth.uid() = user_id);

create policy "style_reports_insert_own"
  on public.style_reports for insert
  with check (auth.uid() = user_id);

create policy "style_reports_update_own"
  on public.style_reports for update
  using (auth.uid() = user_id);

create policy "style_reports_delete_own"
  on public.style_reports for delete
  using (auth.uid() = user_id);

-- ── Storage bucket for uploaded photos ──────────────────────────
-- Private bucket. Objects are stored under `${auth.uid()}/${reportId}/${slot}.jpg`,
-- so RLS can be enforced purely from the path's first folder segment.
insert into storage.buckets (id, name, public)
values ('style-photos', 'style-photos', false)
on conflict (id) do nothing;

create policy "style_photos_select_own"
  on storage.objects for select
  using (
    bucket_id = 'style-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "style_photos_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'style-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "style_photos_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'style-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
