-- ════════════════════════════════════════════════════════════════
-- DietLife — initial schema (Phase 2)
--
-- Spec §3 data model. Every table is owned per-user and protected by
-- Row Level Security: default-deny, owner-only (auth.uid() = user_id).
--
-- The user's Gemini API key is "server-only readable": it lives in a
-- dedicated user_secrets table whose RLS is enabled with ZERO policies, so
-- no client role can read/write any row regardless of grants. Only the
-- service-role admin client (which bypasses RLS) can access it. (Column-level
-- REVOKE on Supabase is unreliable due to grantor mismatch — RLS default-deny
-- is the robust mechanism.)
-- ════════════════════════════════════════════════════════════════

-- ── helper: keep updated_at fresh ───────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ════════════════════════════════════════════════════════════════
-- profiles — 1:1 with auth.users
-- ════════════════════════════════════════════════════════════════
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  gender              text check (gender in ('male', 'female')),
  age                 integer check (age > 0 and age < 150),
  height              numeric(5, 1) check (height > 0),          -- cm
  weight              numeric(5, 1) check (weight > 0),          -- kg
  activity_level      numeric(3, 2) check (activity_level >= 1 and activity_level <= 3), -- TDEE multiplier
  daily_calorie_goal  integer check (daily_calorie_goal >= 0),
  protein_goal        integer check (protein_goal >= 0),
  carbs_goal          integer check (carbs_goal >= 0),
  fat_goal            integer check (fat_goal >= 0),
  fiber_goal          integer check (fiber_goal >= 0),
  sodium_goal         integer check (sodium_goal >= 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner full access"
  on public.profiles for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.profiles to authenticated;

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ════════════════════════════════════════════════════════════════
-- weight_logs
-- ════════════════════════════════════════════════════════════════
create table public.weight_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  datetime    timestamptz not null,
  weight      numeric(5, 1) not null check (weight > 0),         -- kg
  created_at  timestamptz not null default now()
);

alter table public.weight_logs enable row level security;

create policy "weight_logs: owner full access"
  on public.weight_logs for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index weight_logs_user_datetime_idx
  on public.weight_logs (user_id, datetime desc);

grant select, insert, update, delete on public.weight_logs to authenticated;

-- ════════════════════════════════════════════════════════════════
-- diet_logs
-- ════════════════════════════════════════════════════════════════
create table public.diet_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  datetime    timestamptz not null,
  name        text not null,
  category    text,
  calories    numeric not null default 0 check (calories >= 0),
  protein     numeric not null default 0 check (protein >= 0),
  carbs       numeric not null default 0 check (carbs >= 0),
  fat         numeric not null default 0 check (fat >= 0),
  fiber       numeric not null default 0 check (fiber >= 0),
  sodium      numeric not null default 0 check (sodium >= 0),
  image       text,                                              -- storage URL/path (Phase 3.5)
  created_at  timestamptz not null default now()
);

alter table public.diet_logs enable row level security;

create policy "diet_logs: owner full access"
  on public.diet_logs for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index diet_logs_user_datetime_idx
  on public.diet_logs (user_id, datetime desc);

grant select, insert, update, delete on public.diet_logs to authenticated;

-- ════════════════════════════════════════════════════════════════
-- exercise_logs
-- ════════════════════════════════════════════════════════════════
create table public.exercise_logs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  datetime         timestamptz not null,
  type             text not null,
  duration         integer check (duration >= 0),               -- minutes
  calories_burned  numeric not null default 0 check (calories_burned >= 0),
  created_at       timestamptz not null default now()
);

alter table public.exercise_logs enable row level security;

create policy "exercise_logs: owner full access"
  on public.exercise_logs for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index exercise_logs_user_datetime_idx
  on public.exercise_logs (user_id, datetime desc);

grant select, insert, update, delete on public.exercise_logs to authenticated;

-- ════════════════════════════════════════════════════════════════
-- favorite_foods
-- ════════════════════════════════════════════════════════════════
create table public.favorite_foods (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  category    text,
  calories    numeric not null default 0 check (calories >= 0),
  protein     numeric not null default 0 check (protein >= 0),
  carbs       numeric not null default 0 check (carbs >= 0),
  fat         numeric not null default 0 check (fat >= 0),
  fiber       numeric not null default 0 check (fiber >= 0),
  sodium      numeric not null default 0 check (sodium >= 0),
  created_at  timestamptz not null default now()
);

alter table public.favorite_foods enable row level security;

create policy "favorite_foods: owner full access"
  on public.favorite_foods for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index favorite_foods_user_idx
  on public.favorite_foods (user_id);

grant select, insert, update, delete on public.favorite_foods to authenticated;

-- ════════════════════════════════════════════════════════════════
-- user_secrets — server-only store for the per-user Gemini API key.
-- RLS is enabled with NO policies → anon/authenticated are denied every
-- row. Only the service-role admin client (BYPASSRLS) can read/write it.
-- ════════════════════════════════════════════════════════════════
create table public.user_secrets (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  gemini_api_key  text,
  updated_at      timestamptz not null default now()
);

alter table public.user_secrets enable row level security;
-- (no policies on purpose)

create trigger user_secrets_set_updated_at
  before update on public.user_secrets
  for each row execute function public.set_updated_at();
