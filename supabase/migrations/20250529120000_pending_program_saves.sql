create table if not exists public.pending_program_saves (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  plan jsonb not null,
  profile jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index if not exists pending_program_saves_expires_idx
  on public.pending_program_saves (expires_at);

comment on table public.pending_program_saves is
  'Temporary workout plans queued before magic-link auth completes; promoted into saved_programs on callback.';

alter table public.pending_program_saves enable row level security;

-- No client policies: only service-role Route Handlers read/write this table.
