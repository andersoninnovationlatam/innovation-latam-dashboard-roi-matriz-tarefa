# 07 — Schema do Banco de Dados: Fábrica de Inovação

Schema SQL completo para o Supabase. Criar via Supabase CLI:
```bash
npx supabase migration new fabrica_inovacao_schema
```
Cole o SQL abaixo na migração gerada em `supabase/migrations/`.

---

## SQL da migração inicial

```sql
-- ============================================================
-- ENUMS
-- ============================================================

create type client_status as enum ('active', 'inactive', 'negotiation');
create type project_status as enum ('active', 'paused', 'completed', 'at_risk');
create type health_status  as enum ('ok', 'warning', 'critical');
create type user_role      as enum ('gestor', 'consultor', 'viewer');

-- ============================================================
-- PROFILES (extensão da tabela auth.users do Supabase)
-- ============================================================

create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       user_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: cria profile automaticamente ao criar usuário
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'viewer');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- CLIENTES
-- ============================================================

create table clients (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,           -- ex: 'LBP', 'INL', 'CEB'
  name       text not null,                  -- ex: 'Liberty Pools'
  status     client_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROJETOS
-- ============================================================

create table projects (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  name        text not null,
  description text,
  status      project_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_projects_client_id on projects(client_id);

-- ============================================================
-- ATRIBUIÇÃO DE CONSULTORES A PROJETOS
-- Junction table: define quais consultores/viewers têm acesso
-- a quais projetos. Gestores têm acesso irrestrito (via RLS).
-- ============================================================

create table project_consultants (
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  primary key (project_id, user_id)
);

-- ============================================================
-- REUNIÕES
-- ============================================================

create table meetings (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  meeting_date date not null,
  title        text not null,
  raw_notes    text,                          -- transcrição bruta, opcional
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_meetings_project_id on meetings(project_id);
create index idx_meetings_date       on meetings(meeting_date desc);

-- ============================================================
-- INSIGHTS DA REUNIÃO (os 9 agentes)
-- Relação 1:1 com meetings. JSONB por agente para flexibilidade.
-- ============================================================

create table meeting_insights (
  id                  uuid primary key default gen_random_uuid(),
  meeting_id          uuid not null unique references meetings(id) on delete cascade,

  -- Agente 1: Perfilador
  -- Estrutura: { "participants": [{ name, estimated_role, archetype,
  --   driver, ice_breakers[], conflict_alert? }] }
  perfilador          jsonb,

  -- Agente 2: Advogado do Diabo (Riscos)
  -- Estrutura: { "risks": [{ severity, type, description, impact?, recommendation? }] }
  -- severity: 'critical' | 'warning' | 'info'
  -- type: 'scope_creep' | 'external_risk' | 'smoke_signal' | 'temperature'
  advogado_diabo      jsonb,

  -- Agente 3: Auditor de Entregas
  -- Estrutura: { "deliveries": [{ item, status, evidence? }] }
  -- status: 'approved' | 'approved_with_caveats' | 'pending' | 'blocked'
  auditor_entregas    jsonb,

  -- Agente 4: Arquiteto (Automações + Contexto Técnico)
  -- Estrutura: {
  --   "automation_framework": [{ step, description, suggestion, rationale }],
  --   "tech_context": { stack[], inputs[], outputs[], connectivity, main_pain }
  -- }
  -- suggestion: 'ia' | 'hibrido' | 'humano'
  arquiteto           jsonb,

  -- Agente 5: Estrategista
  -- Estrutura: {
  --   "executive_summary": string,
  --   "follow_up_email": { subject, body },
  --   "impact_score": number (0-10),
  --   "new_commitments": [{ what, who, deadline, status }]
  -- }
  estrategista        jsonb,

  -- Agente 6: Temperatura do Cliente
  -- Estrutura: { "level": 'low'|'moderate'|'high', "signals": [], "description": string }
  temperatura         jsonb,

  -- Agente 7: Compromissos (tabela compacta)
  -- Estrutura: { "commitments": [{ what, who, deadline, status }] }
  -- status: 'defined' | 'to_confirm' | 'delivered'
  compromissos        jsonb,

  -- Agente 8: Validação de Entregas (pendências do cliente)
  -- Estrutura: { "client_pending": [{ action, responsible, deadline }] }
  validacao_entregas  jsonb,

  -- Agente 9: Contexto Técnico (separado do arquiteto para busca futura)
  -- Estrutura: { stack[], inputs[], expected_outputs[], main_pain, volume_frequency }
  contexto_tecnico    jsonb,

  -- Combinado: Parecer Geral
  parecer_geral       text,

  -- Semáforo calculado: alimenta o dashboard do gestor
  -- ok = projeto dentro do combinado
  -- warning = desvios moderados, sem risco crítico confirmado
  -- critical = risco crítico confirmado ou scope creep sem aditivo
  health_status       health_status not null default 'ok',

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_meeting_insights_meeting_id on meeting_insights(meeting_id);
create index idx_meeting_insights_health     on meeting_insights(health_status);

-- ============================================================
-- VIEW: STATUS ATUAL DE CADA PROJETO
-- Pega health_status da reunião mais recente de cada projeto.
-- Usada pelo dashboard para calcular o status dos clientes.
-- ============================================================

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
  select m.*
  from meetings m
  where m.project_id = p.id
  order by m.meeting_date desc
  limit 1
) m on true
left join meeting_insights mi on mi.meeting_id = m.id;

-- ============================================================
-- VIEW: STATUS ATUAL DE CADA CLIENTE
-- Agrega o pior health_status entre todos os projetos do cliente.
-- ============================================================

create or replace view client_current_health as
select
  c.id          as client_id,
  c.code,
  c.name,
  c.status      as client_status,
  case
    when bool_or(pch.health_status = 'critical') then 'critical'::health_status
    when bool_or(pch.health_status = 'warning')  then 'warning'::health_status
    else 'ok'::health_status
  end           as health_status,
  count(pch.project_id) filter (where pch.project_status = 'active') as active_projects,
  max(pch.latest_meeting_date) as last_meeting_date
from clients c
left join project_current_health pch on pch.client_id = c.id
group by c.id, c.code, c.name, c.status;

-- ============================================================
-- RLS — ROW LEVEL SECURITY
-- ============================================================

alter table profiles             enable row level security;
alter table clients              enable row level security;
alter table projects             enable row level security;
alter table project_consultants  enable row level security;
alter table meetings             enable row level security;
alter table meeting_insights     enable row level security;

-- Helper: retorna o role do usuário autenticado
create or replace function get_my_role()
returns user_role language sql security definer as $$
  select role from profiles where id = auth.uid();
$$;

-- Helper: verifica se o usuário tem acesso a um projeto
create or replace function has_project_access(p_project_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from project_consultants
    where project_id = p_project_id
      and user_id = auth.uid()
  ) or get_my_role() = 'gestor';
$$;

-- PROFILES: usuário vê e edita apenas seu próprio profile; gestor vê todos
create policy "profiles: usuario le proprio" on profiles
  for select using (id = auth.uid() or get_my_role() = 'gestor');

create policy "profiles: usuario atualiza proprio" on profiles
  for update using (id = auth.uid());

-- CLIENTS: gestor gerencia; consultor/viewer lê clientes de projetos atribuídos
create policy "clients: gestor full access" on clients
  for all using (get_my_role() = 'gestor');

create policy "clients: consultor le clientes atribuidos" on clients
  for select using (
    get_my_role() in ('consultor', 'viewer')
    and exists (
      select 1 from projects p
      join project_consultants pc on pc.project_id = p.id
      where p.client_id = clients.id
        and pc.user_id = auth.uid()
    )
  );

-- PROJECTS: gestor gerencia; consultor/viewer lê projetos atribuídos
create policy "projects: gestor full access" on projects
  for all using (get_my_role() = 'gestor');

create policy "projects: consultor le atribuidos" on projects
  for select using (
    get_my_role() in ('consultor', 'viewer')
    and has_project_access(id)
  );

-- PROJECT_CONSULTANTS: apenas gestor gerencia atribuições
create policy "project_consultants: gestor full access" on project_consultants
  for all using (get_my_role() = 'gestor');

create policy "project_consultants: consultor le proprios" on project_consultants
  for select using (user_id = auth.uid());

-- MEETINGS: gestor gerencia; consultor cria/edita em projetos atribuídos; viewer só lê
create policy "meetings: gestor full access" on meetings
  for all using (get_my_role() = 'gestor');

create policy "meetings: consultor cria e edita atribuidos" on meetings
  for all using (
    get_my_role() = 'consultor'
    and has_project_access(project_id)
  );

create policy "meetings: viewer le atribuidos" on meetings
  for select using (
    get_my_role() = 'viewer'
    and has_project_access(project_id)
  );

-- MEETING_INSIGHTS: segue as mesmas regras de meetings
create policy "insights: gestor full access" on meeting_insights
  for all using (get_my_role() = 'gestor');

create policy "insights: consultor cria e edita" on meeting_insights
  for all using (
    get_my_role() = 'consultor'
    and exists (
      select 1 from meetings m
      where m.id = meeting_id
        and has_project_access(m.project_id)
    )
  );

create policy "insights: viewer le" on meeting_insights
  for select using (
    get_my_role() = 'viewer'
    and exists (
      select 1 from meetings m
      where m.id = meeting_id
        and has_project_access(m.project_id)
    )
  );

-- ============================================================
-- DADOS INICIAIS (seed para desenvolvimento)
-- ============================================================

-- Inserir clientes da planilha original
insert into clients (code, name, status) values
  ('INL', 'Innovation Latam',  'active'),
  ('LBP', 'Liberty Pools',     'active'),
  ('LGL', 'Log-In Logística',  'active'),
  ('CEB', 'Corona & Bio',      'active'),
  ('BYR', 'Bayer',             'active');
```

---

## Estrutura de pastas para esta feature

Seguindo o padrão do `02-stack-e-arquitetura.md`:

```
app/
  (dashboard)/
    dashboard/
      page.tsx                         ← visão geral: ClientCard grid + métricas
      clientes/
        page.tsx                       ← lista de clientes
        [clientId]/
          page.tsx                     ← detalhe do cliente + projetos
          projetos/
            [projectId]/
              page.tsx                 ← histórico de reuniões do projeto
              reunioes/
                nova/
                  page.tsx             ← formulário nova reunião
                [meetingId]/
                  page.tsx             ← MeetingInsightPanel (9 agentes)

components/
  features/
    dashboard/
      client-card.tsx                  ← ClientCard
      health-badge.tsx                 ← HealthBadge
      metric-card.tsx                  ← MetricCard
    meetings/
      meeting-insight-panel.tsx        ← painel 9 agentes (grid 3x3)
      agent-cell.tsx                   ← célula individual de agente
      agent-perfilador.tsx             ← renderização específica do Perfilador
      agent-advogado-diabo.tsx         ← renderização do Advogado do Diabo
      agent-auditor.tsx                ← renderização do Auditor
      agent-compromissos.tsx           ← renderização dos Compromissos
      meeting-form.tsx                 ← formulário de nova reunião

server/
  actions/
    clients.ts                         ← getClientOverview, getClientById
    projects.ts                        ← getProjectMeetings, getProjectById
    meetings.ts                        ← getMeetingInsights, upsertMeetingInsights
  services/
    health.ts                          ← calculateHealthStatus (função pura)

lib/
  types/
    domain.ts                          ← todos os tipos TypeScript do domínio
  supabase/
    client.ts                          ← cliente browser
    server.ts                          ← cliente server (cookies)
```

---

## Queries Supabase úteis para referência

### Dashboard: todos os clientes com health status atual

```typescript
const { data } = await supabase
  .from('client_current_health')
  .select('*')
  .order('health_status', { ascending: true }) // critical primeiro
```

### Projeto: health de todos os projetos de um cliente

```typescript
const { data } = await supabase
  .from('project_current_health')
  .select('*')
  .eq('client_id', clientId)
  .order('latest_meeting_date', { ascending: false })
```

### Reunião: buscar insights completos

```typescript
const { data } = await supabase
  .from('meeting_insights')
  .select(`
    *,
    meetings (
      id, meeting_date, title, project_id,
      projects ( id, name, client_id,
        clients ( id, code, name )
      )
    )
  `)
  .eq('meeting_id', meetingId)
  .single()
```

### Upsert de insights (criar ou atualizar)

```typescript
const { data } = await supabase
  .from('meeting_insights')
  .upsert({
    meeting_id: meetingId,
    perfilador: perfiladorData,
    advogado_diabo: advogadoData,
    // ... outros agentes
    parecer_geral: parecerText,
    health_status: calculatedStatus,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'meeting_id'
  })
  .select()
  .single()
```

---

## Regras para o Cursor ao implementar esta feature

1. **Sempre usar as views** `client_current_health` e `project_current_health` para o dashboard — nunca calcular o status no frontend.
2. **`calculateHealthStatus`** em `server/services/health.ts` é a única fonte de verdade para o semáforo. Qualquer mudança nas regras de negócio do health vai nesta função.
3. **JSONB é flexível** — não quebrar ao encontrar campos nulos ou ausentes. Usar optional chaining (`?.`) em toda renderização de dados JSONB.
4. **Não criar tabelas sem migração** via Supabase CLI. Nunca usar SQL avulso.
5. **Tipos do domínio** em `lib/types/domain.ts` são a fonte de verdade dos TypeScript types. Não duplicar tipos em arquivos de componente.
6. **Zod schema** obrigatório antes de qualquer `upsertMeetingInsights`. Criar em `lib/schemas/meeting-insights.ts`.
