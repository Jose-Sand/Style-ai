-- Style AI — product scraping cache + error log
-- Both tables are internal/system data (no user_id column, not
-- user-facing). RLS is enabled with zero policies, so the anon and
-- authenticated roles get no access at all; only the service_role key
-- (which bypasses RLS) can read/write them. The app only touches these
-- from the server-side /api/products/search route via
-- createServiceRoleClient().

create table if not exists public.product_cache (
  id         uuid primary key default gen_random_uuid(),
  cache_key  text unique not null,
  results    jsonb not null,
  brand      text,
  cached_at  timestamptz not null default now()
);

alter table public.product_cache enable row level security;

create table if not exists public.scraper_errors (
  id         uuid primary key default gen_random_uuid(),
  brand      text,
  error      text,
  url        text,
  created_at timestamptz not null default now()
);

create index if not exists scraper_errors_created_at_idx
  on public.scraper_errors (created_at desc);

alter table public.scraper_errors enable row level security;
