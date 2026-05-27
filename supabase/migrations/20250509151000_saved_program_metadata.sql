alter table public.saved_programs
  add column if not exists training_style text not null default '',
  add column if not exists emphasis text[] not null default '{}',
  add column if not exists generated_plan_json jsonb;

update public.saved_programs
set generated_plan_json = plan
where generated_plan_json is null;

alter table public.saved_programs
  alter column generated_plan_json set not null;

comment on column public.saved_programs.training_style is 'Selected training style at generation time';
comment on column public.saved_programs.emphasis is 'Selected muscle-group emphasis at generation time';
comment on column public.saved_programs.generated_plan_json is 'Canonical generated workout plan JSON for future program reopening and tracking';
