-- Recria a view project_current_health garantindo que parecer_geral seja exposto.
-- A view pode ter sido criada manualmente antes do campo existir em meeting_insights.

create or replace view project_current_health as
select
  p.id                  as project_id,
  p.client_id,
  p.name                as project_name,
  p.status              as project_status,
  m.id                  as latest_meeting_id,
  m.meeting_date        as latest_meeting_date,
  m.title               as latest_meeting_title,
  mi.health_status      as health_status,
  mi.parecer_geral      as parecer_geral
from projects p
left join lateral (
  select m2.*
  from meetings m2
  where m2.project_id = p.id
  order by m2.meeting_date desc
  limit 1
) m on true
left join meeting_insights mi on mi.meeting_id = m.id;
