# 06 — Fábrica de Inovação: Plataforma de Controle de Projetos

Documento de contexto específico da plataforma de gestão. Leia este arquivo inteiro antes de implementar qualquer feature relacionada ao domínio de clientes, projetos, reuniões ou insights.

---

## O que é esta plataforma

Sistema interno de gestão de projetos de inovação da **Innovation Latam**. Permite que gestores acompanhem em tempo real o andamento de projetos com clientes, visualizem os insights gerados pelas reuniões e identifiquem alertas críticos (scope creep, riscos, temperatura do cliente) sem precisar ler transcrições brutas.

A fonte de dados original é uma planilha Excel onde cada aba é um cliente, cada linha é uma reunião e cada coluna é um "agente" especializado que analisa um aspecto diferente da reunião.

---

## Hierarquia de entidades

```
Cliente
  └── Projeto (1 cliente pode ter N projetos)
        └── Reunião (1 projeto tem N reuniões ao longo do tempo)
              └── InsightsDaReuniao (1 reunião gera exatamente 1 registro de insights)
```

### Cliente

Empresa ou organização contratante.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `code` | text | Código curto de 3 letras usado na planilha (ex: `LBP`, `INL`, `CEB`) |
| `name` | text | Nome completo (ex: "Liberty Pools") |
| `status` | enum | `active` \| `inactive` \| `negotiation` |
| `created_at` | timestamptz | |

### Projeto

Cada iniciativa dentro de um cliente. Um cliente pode ter múltiplos projetos simultâneos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `client_id` | uuid | FK → clientes |
| `name` | text | Nome do projeto (ex: "Dashboard operacional", "Copiloto de campo") |
| `description` | text | Descrição livre |
| `status` | enum | `active` \| `paused` \| `completed` \| `at_risk` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Atualizado ao persistir alterações do projeto |
| `ai_strategic_insight` | jsonb (opcional) | Insight estratégico gerado por IA a partir das reuniões do projeto (`body`, `tag`, `actions[]`, `upcoming_actions[]` com `title`/`due_hint` a partir de compromissos e auditor de entregas). Atualizado automaticamente ao criar reunião e ao gerar insights de reunião. |

### Reunião

Cada encontro registrado com o cliente, ligado a um projeto específico.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `project_id` | uuid | FK → projetos |
| `meeting_date` | date | Data da reunião |
| `title` | text | Título descritivo da reunião |
| `raw_notes` | text | Texto bruto/transcrição original (opcional) |
| `created_at` | timestamptz | |

### InsightsDaReuniao

Os 9 agentes especializados que analisam cada reunião. **Sempre 1 para 1 com Reunião.**

| Campo | Tipo | Agente | O que armazena |
|-------|------|--------|----------------|
| `id` | uuid | — | PK |
| `meeting_id` | uuid | — | FK → reunioes (UNIQUE — 1:1) |
| `perfilador` | jsonb | 1 · Perfilador (Dossiê) | Array de participantes com: nome, cargo estimado, arquétipo, driver, ice breakers, alerta de conflito |
| `advogado_diabo` | jsonb | 2 · Advogado do Diabo (Riscos) | Scope creep detectado, riscos externos, sinal de fumaça, sentimento/temperatura |
| `auditor_entregas` | jsonb | 3 · Auditor de Entregas | Lista de entregáveis com status: aprovado / com ressalvas / aguardando |
| `arquiteto` | jsonb | 4 · Arquiteto (Automações) | Framework IA/Híbrido/Humano + ambiente técnico (stack, inputs, outputs) |
| `estrategista` | jsonb | 5 · Estrategista | Resumo executivo, e-mail de follow-up sugerido, score de impacto (0–10) |
| `temperatura` | jsonb | 6 · Temperatura do cliente | Nível de stress, sinais de cobrança, sarcasmo, pressa |
| `compromissos` | jsonb | 7 · Compromissos | Lista de promessas com: o quê, quem prometeu, prazo, status inicial |
| `validacao_entregas` | jsonb | 8 · Validação de Entregas | Pendências do cliente com responsável e prazo |
| `contexto_tecnico` | jsonb | 9 · Contexto Técnico | Stack, conectividade, insumos, output esperado, dores e indicadores |
| `parecer_geral` | text | Combinado | Texto do parecer final: dentro do combinado / desvio / risco crítico + recomendação |
| `health_status` | enum | Calculado | `ok` \| `warning` \| `critical` — alimenta o semáforo do dashboard |
| `created_at` | timestamptz | — | |

---

## Regras de negócio desta plataforma

### Semáforo de saúde (`health_status`)

O campo `health_status` em `InsightsDaReuniao` determina o indicador visual no dashboard do gestor:

- `ok` (verde) — Parecer geral indica projeto dentro do combinado, sem riscos críticos.
- `warning` (amarelo) — Desvios de expectativa ou riscos moderados detectados pelo Advogado do Diabo; sem risco crítico confirmado.
- `critical` (vermelho) — Risco crítico confirmado no parecer geral OU scope creep aceito sem aditivo contratual OU temperatura do cliente classificada como "alto".

**Regra de cálculo:** O `health_status` da reunião mais recente de cada projeto determina o status do projeto. O status do projeto mais crítico de cada cliente determina o status do cliente no dashboard geral.

### Status do projeto

- `active` — em andamento normal
- `at_risk` — tem pelo menos uma reunião com `health_status = critical`
- `paused` — pausado por decisão interna
- `completed` — entregue

### Atribuição de consultores

Um `consultor` só vê clientes e projetos ligados a ele via tabela `project_consultants` (junction). O `gestor` vê tudo.

### Imutabilidade dos insights

Insights de uma reunião não devem ser apagados — apenas atualizados (`updated_at`). O histórico completo de reuniões sempre permanece.

---

## Estrutura de telas e rotas

### Rotas públicas (sem auth)
- `/` — Landing (não necessária nesta fase, pode ser redirect para `/login`)
- `/login` — Login
- `/cadastro` — Cadastro (apenas gestores criam contas; consultores são convidados)

### Rotas protegidas (auth obrigatório)

| Rota | Quem acessa | Descrição |
|------|------------|-----------|
| `/dashboard` | gestor, consultor, viewer | Visão geral — cards de clientes com semáforo, métricas agregadas |
| `/dashboard/clientes` | gestor, consultor | Lista de clientes atribuídos |
| `/dashboard/clientes/[clientId]` | gestor, consultor | Detalhe do cliente — lista de projetos e última reunião |
| `/dashboard/clientes/[clientId]/projetos/[projectId]` | gestor, consultor | Detalhe do projeto — histórico de reuniões |
| `/dashboard/clientes/[clientId]/projetos/[projectId]/reunioes/[meetingId]` | gestor, consultor | Detalhe da reunião — os 9 agentes visíveis em abas ou accordion |
| `/dashboard/clientes/[clientId]/projetos/[projectId]/reunioes/nova` | gestor, consultor | Criar/importar nova reunião e seus insights |
| `/dashboard/admin` | apenas gestor | Gerenciar usuários, clientes e atribuições |

### Middleware de auth

Usar Supabase SSR middleware para proteger todas as rotas `/dashboard/*`. Redirecionar para `/login` se não autenticado. Verificar perfil (gestor/consultor/viewer) via claim no JWT ou tabela `profiles`.

---

## Componentes principais a implementar

### `ClientCard`
Card do cliente no dashboard. Exibe: nome, código, badge de status (`ok`/`warning`/`critical`), última reunião, trecho do parecer geral. Clicável → navega para detalhe do cliente.

Props: `client: Client`, `latestHealth: HealthStatus`, `latestMeeting: Meeting | null`, `parecerExcerpt: string`

### `MeetingInsightPanel`
Painel de detalhe de uma reunião. Exibe os 9 agentes organizados em grid 3×3 (como no protótipo aprovado). Cada célula tem: label do agente (número + nome), conteúdo estruturado do JSONB.

O campo `parecer_geral` aparece em destaque abaixo do grid, com cor de fundo baseada em `health_status`.

### `AgentCell`
Célula individual dentro do `MeetingInsightPanel`. Recebe o nome do agente e o dado JSONB e renderiza de forma adequada para cada tipo:
- Perfilador → avatares + chips de arquétipo
- Advogado do Diabo → lista de riscos com ícone de severidade
- Auditor → lista com ícones ✓ / ~ / ○
- Compromissos → tabela compacta com responsável, o quê, prazo
- Temperatura → badge de nível + texto descritivo

### `HealthBadge`
Badge reutilizável. Recebe `status: 'ok' | 'warning' | 'critical'` e renderiza com as cores corretas usando variáveis do tema (nunca hardcode de cor).

### `MetricCard`
Card de métrica do topo do dashboard. Recebe `label`, `value`, `note` (opcional). Fundo `bg-secondary`, sem borda.

---

## Server Actions e Services

### `getClientOverview(userId: string)`
Retorna todos os clientes visíveis pelo usuário com o `health_status` da reunião mais recente de cada projeto. Respeita perfil: gestor vê todos, consultor/viewer vê apenas os atribuídos.

### `getProjectMeetings(projectId: string, userId: string)`
Retorna reuniões de um projeto em ordem decrescente de data. Verifica se o usuário tem acesso ao projeto.

### `getMeetingInsights(meetingId: string, userId: string)`
Retorna o registro completo de `InsightsDaReuniao` para uma reunião. Verifica acesso.

### `upsertMeetingInsights(meetingId: string, insights: MeetingInsightsInput)`
Cria ou atualiza os insights de uma reunião. Calcula e persiste `health_status` automaticamente com base nas regras definidas. Apenas gestor e consultor podem executar.

### `calculateHealthStatus(insights: MeetingInsightsInput): HealthStatus`
Função pura (sem I/O) que aplica as regras de semáforo. Exportada de `server/services/health.ts`. Testável de forma isolada.

---

## Tipos TypeScript centrais

Definir em `lib/types/domain.ts`:

```typescript
export type HealthStatus = 'ok' | 'warning' | 'critical'

export type ClientStatus = 'active' | 'inactive' | 'negotiation'

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'at_risk'

export type UserRole = 'gestor' | 'consultor' | 'viewer'

export interface Client {
  id: string
  code: string
  name: string
  status: ClientStatus
  created_at: string
}

export interface Project {
  id: string
  client_id: string
  name: string
  description: string
  status: ProjectStatus
  created_at: string
}

export interface Meeting {
  id: string
  project_id: string
  meeting_date: string
  title: string
  raw_notes?: string
  created_at: string
}

export interface Participant {
  name: string
  estimated_role: string
  archetype: 'executor' | 'visionario' | 'cetico' | 'decisor_economico'
  driver: string
  ice_breakers: string[]
  conflict_alert?: string
}

export interface RiskItem {
  severity: 'critical' | 'warning' | 'info'
  type: 'scope_creep' | 'external_risk' | 'smoke_signal' | 'temperature'
  description: string
  impact?: string
  recommendation?: string
}

export interface DeliveryItem {
  item: string
  status: 'approved' | 'approved_with_caveats' | 'pending' | 'blocked'
  evidence?: string
}

export interface Commitment {
  what: string
  who: string
  deadline: string | null
  status: 'defined' | 'to_confirm' | 'delivered'
}

export interface MeetingInsights {
  id: string
  meeting_id: string
  perfilador: { participants: Participant[] }
  advogado_diabo: { risks: RiskItem[] }
  auditor_entregas: { deliveries: DeliveryItem[] }
  arquiteto: {
    automation_framework: Array<{ step: number; description: string; suggestion: 'ia' | 'hibrido' | 'humano'; rationale: string }>
    tech_context: { stack: string[]; inputs: string[]; outputs: string[] }
  }
  estrategista: {
    executive_summary: string
    follow_up_email: { subject: string; body: string }
    impact_score: number
  }
  temperatura: {
    level: 'low' | 'moderate' | 'high'
    signals: string[]
    description: string
  }
  compromissos: { commitments: Commitment[] }
  validacao_entregas: {
    client_pending: Array<{ action: string; responsible: string; deadline: string | null }>
  }
  contexto_tecnico: {
    stack: string[]
    connectivity: string
    inputs: string[]
    expected_outputs: string[]
    main_pain: string
  }
  parecer_geral: string
  health_status: HealthStatus
  created_at: string
}
```

---

## Fluxo de importação de dados da planilha

A planilha Excel original (fonte de dados) pode ser importada via:

1. **Upload manual** — gestor faz upload do `.xlsx`, o sistema parseia e popula as entidades.
2. **Entrada manual** — gestor preenche formulário de nova reunião e cola os textos dos agentes em campos de texto livre.
3. **Integração futura** — webhook ou API de IA que gera os insights automaticamente após uma transcrição de reunião.

Na fase atual, implementar apenas a **entrada manual** (opção 2). O upload de planilha e a geração automática por IA são fases posteriores, não implementar agora.

---

## O que NÃO implementar nesta fase

- Upload de planilha Excel (fase futura)
- Geração automática de insights por IA (fase futura)
- Notificações por e-mail ou Slack (fase futura)
- Relatórios exportáveis em PDF (fase futura)
- Integração com ferramentas externas (Jira, Notion, etc.)

Documentar essas extensões aqui quando entrarem no escopo.
