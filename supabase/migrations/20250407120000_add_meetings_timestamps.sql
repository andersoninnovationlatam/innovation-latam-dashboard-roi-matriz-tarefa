-- meetings: timestamps expected by app (getProjectMeetings selects created_at) and docs (07-fabrica-inovacao-schema.md)
alter table public.meetings
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();
