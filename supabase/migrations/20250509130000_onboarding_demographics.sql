alter table public.onboarding_profiles
  add column if not exists sex text not null default '',
  add column if not exists age smallint not null default 0,
  add column if not exists weight_kg double precision not null default 0,
  add column if not exists height_cm double precision not null default 0;

comment on column public.onboarding_profiles.sex is 'User-reported sex for programming context (see app privacy copy)';
comment on column public.onboarding_profiles.age is 'Age in years';
comment on column public.onboarding_profiles.weight_kg is 'Body mass in kilograms';
comment on column public.onboarding_profiles.height_cm is 'Height in centimeters';
