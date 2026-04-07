-- Consultor: apenas leitura em meetings/meeting_insights nos projetos atribuídos.
-- Escrita (insert/update/delete) fica só para gestor (políticas existentes "gestor full access").

drop policy if exists "meetings: consultor cria e edita atribuidos" on public.meetings;

create policy "meetings: consultor le atribuidos"
  on public.meetings
  for select
  using (
    get_my_role() = 'consultor'
    and has_project_access(project_id)
  );

drop policy if exists "insights: consultor cria e edita" on public.meeting_insights;

create policy "insights: consultor le"
  on public.meeting_insights
  for select
  using (
    get_my_role() = 'consultor'
    and exists (
      select 1 from meetings m
      where m.id = meeting_insights.meeting_id
        and has_project_access(m.project_id)
    )
  );
