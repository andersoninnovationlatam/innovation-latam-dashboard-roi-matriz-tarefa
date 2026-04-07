-- Insight estratégico agregado ao nível do projeto (gerado por IA, JSON).
alter table public.projects
  add column if not exists updated_at timestamptz not null default now();

alter table public.projects
  add column if not exists ai_strategic_insight jsonb;

comment on column public.projects.ai_strategic_insight is
  'Insight estratégico sintetizado a partir das reuniões do projeto: { body, tag, actions[] }.';
