-- Canonical waitlist table for landing page signups
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.waitlist is 'Landing page waitlist email captures';

-- Migrate legacy signups when present
insert into public.waitlist (email, created_at)
select email, created_at
from public.waitlist_signups
on conflict (email) do nothing;

alter table public.waitlist enable row level security;

create policy "waitlist_insert_public"
  on public.waitlist for insert
  to anon, authenticated
  with check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');

grant insert on table public.waitlist to anon, authenticated;
