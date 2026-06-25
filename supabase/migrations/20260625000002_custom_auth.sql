-- ════════════════════════════════════════════════════════════════
-- Switch from Supabase Auth to a custom username+password system.
-- Accounts live in app_users (password scrypt-hashed by the app). All data
-- access is server-side via the service role, scoped by the session user id;
-- RLS stays enabled (no client-usable policies) as a second line of defence.
-- ════════════════════════════════════════════════════════════════

create table public.app_users (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique,
  password_hash text not null,
  created_at    timestamptz not null default now()
);
alter table public.app_users enable row level security;
-- no policies: service-role only (client never queries Supabase directly)

-- Remove the old Supabase-auth new-user trigger.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Wipe data keyed to old auth.users ids before repointing FKs (dev data).
truncate table public.profiles, public.weight_logs, public.diet_logs,
  public.exercise_logs, public.favorite_foods, public.user_secrets cascade;

-- Repoint every foreign key from auth.users → app_users.
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles
  add constraint profiles_id_fkey foreign key (id)
  references public.app_users (id) on delete cascade;

alter table public.weight_logs drop constraint if exists weight_logs_user_id_fkey;
alter table public.weight_logs
  add constraint weight_logs_user_id_fkey foreign key (user_id)
  references public.app_users (id) on delete cascade;

alter table public.diet_logs drop constraint if exists diet_logs_user_id_fkey;
alter table public.diet_logs
  add constraint diet_logs_user_id_fkey foreign key (user_id)
  references public.app_users (id) on delete cascade;

alter table public.exercise_logs drop constraint if exists exercise_logs_user_id_fkey;
alter table public.exercise_logs
  add constraint exercise_logs_user_id_fkey foreign key (user_id)
  references public.app_users (id) on delete cascade;

alter table public.favorite_foods drop constraint if exists favorite_foods_user_id_fkey;
alter table public.favorite_foods
  add constraint favorite_foods_user_id_fkey foreign key (user_id)
  references public.app_users (id) on delete cascade;

alter table public.user_secrets drop constraint if exists user_secrets_user_id_fkey;
alter table public.user_secrets
  add constraint user_secrets_user_id_fkey foreign key (user_id)
  references public.app_users (id) on delete cascade;
