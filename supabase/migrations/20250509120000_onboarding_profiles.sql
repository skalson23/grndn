-- Fitness onboarding questionnaire (one row per auth user; supports anonymous auth)
create table if not exists public.onboarding_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  goals text[] not null default '{}',
  experience text not null default '',
  equipment text[] not null default '{}',
  injuries text[] not null default '{}',
  muscle_groups text[] not null default '{}',
  frequency smallint not null check (frequency >= 1 and frequency <= 7),
  duration smallint not null check (duration > 0 and duration <= 180),
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.onboarding_profiles is 'Onboarding questionnaire answers keyed by Supabase Auth user';

alter table public.onboarding_profiles enable row level security;

create policy "onboarding_select_own"
  on public.onboarding_profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "onboarding_insert_own"
  on public.onboarding_profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "onboarding_update_own"
  on public.onboarding_profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "onboarding_delete_own"
  on public.onboarding_profiles for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.onboarding_profiles to authenticated;

create or replace function public.set_onboarding_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists onboarding_profiles_set_updated_at on public.onboarding_profiles;
create trigger onboarding_profiles_set_updated_at
  before update on public.onboarding_profiles
  for each row execute function public.set_onboarding_updated_at();
