-- Velocidade estimada por IA (0–100), derivada do contexto das reuniões.
alter table public.projects
  add column if not exists ai_velocity jsonb;

comment on column public.projects.ai_velocity is
  'Velocidade estimada por IA: { percent: 0-100, generated_at: ISO8601 }.';
