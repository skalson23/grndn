-- GRNDN subscription & billing status (Stripe-ready, bypassed when ENABLE_PAYMENTS=false)

create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  billing_status text not null default 'beta'
    check (billing_status in ('beta', 'active', 'cancelled', 'expired')),
  current_period_end timestamptz,
  is_beta_grandfathered boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_subscriptions is
  'Stripe subscription state and beta grandfathering per authenticated user';
comment on column public.user_subscriptions.billing_status is
  'beta | active | cancelled | expired — beta users retain access when payments are enabled';
comment on column public.user_subscriptions.is_beta_grandfathered is
  'Set true for closed-beta users or admin-granted beta access';

create index if not exists user_subscriptions_stripe_customer_idx
  on public.user_subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists user_subscriptions_billing_status_idx
  on public.user_subscriptions (billing_status);

alter table public.user_subscriptions enable row level security;

create policy "user_subscriptions_select_own"
  on public.user_subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Inserts/updates via service role (webhooks, admin) only — no client write policies

grant select on table public.user_subscriptions to authenticated;

create or replace function public.set_user_subscriptions_updated_at()
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

drop trigger if exists user_subscriptions_set_updated_at on public.user_subscriptions;
create trigger user_subscriptions_set_updated_at
  before update on public.user_subscriptions
  for each row execute function public.set_user_subscriptions_updated_at();
