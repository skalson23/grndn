create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'closed_beta_landing',
  created_at timestamptz not null default now()
);

comment on table public.waitlist_signups is 'Closed beta waitlist email captures';

alter table public.waitlist_signups enable row level security;

create policy "waitlist_insert_public"
  on public.waitlist_signups for insert
  to anon, authenticated
  with check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');

grant insert on table public.waitlist_signups to anon, authenticated;
