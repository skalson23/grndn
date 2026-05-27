alter table public.onboarding_profiles
  add column if not exists training_style text not null default '';

comment on column public.onboarding_profiles.training_style is
  'Preferred training philosophy: hypertrophy, strength, v_taper, powerbuilding, athletic, minimalist';
