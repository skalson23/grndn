alter table public.onboarding_profiles
  add column if not exists activity_level text not null default '',
  add column if not exists target_weight_kg double precision,
  add column if not exists weight_loss_pace text not null default '';

comment on column public.onboarding_profiles.activity_level is
  'Daily activity level outside the gym for recovery and TDEE context';
comment on column public.onboarding_profiles.target_weight_kg is
  'Optional target body mass for weight-loss users';
comment on column public.onboarding_profiles.weight_loss_pace is
  'Preferred fat-loss pace: aggressive, moderate, sustainable';
