create table if not exists public.saved_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  summary text not null default '',
  session_count smallint not null check (session_count >= 1 and session_count <= 7),
  training_style text not null default '',
  emphasis text[] not null default '{}',
  generated_plan_json jsonb not null,
  plan jsonb not null,
  profile jsonb,
  pdf_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.saved_programs is 'Generated GRNDN workout programs saved after email magic-link authentication';
comment on column public.saved_programs.pdf_metadata is 'Client PDF export metadata such as file name, author, generated timestamp, page count and session count';
comment on column public.saved_programs.generated_plan_json is 'Canonical generated workout plan JSON for future program reopening and tracking';

create index if not exists saved_programs_user_created_idx
  on public.saved_programs (user_id, created_at desc);

alter table public.saved_programs enable row level security;

create policy "saved_programs_select_own"
  on public.saved_programs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "saved_programs_insert_own"
  on public.saved_programs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "saved_programs_update_own"
  on public.saved_programs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "saved_programs_delete_own"
  on public.saved_programs for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.saved_programs to authenticated;

create or replace function public.set_saved_programs_updated_at()
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

drop trigger if exists saved_programs_set_updated_at on public.saved_programs;
create trigger saved_programs_set_updated_at
  before update on public.saved_programs
  for each row execute function public.set_saved_programs_updated_at();
