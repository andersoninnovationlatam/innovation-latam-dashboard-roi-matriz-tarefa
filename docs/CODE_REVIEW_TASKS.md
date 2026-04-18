# Code Review — Innovation Latam Dashboard
**Data:** 2026-04-17  
**Revisor:** Code Review Senior  
**Branch:** main

---

## Resumo Executivo

Total de issues encontradas: **22 tasks**

| Prioridade | Qtd |
|---|---|
| 🔴 Crítica | 6 |
| 🟠 Alta | 8 |
| 🟡 Média | 5 |
| 🔵 Baixa / Melhoria | 3 |

---

## CRÍTICAS — Corrigir imediatamente

---

### TASK-01 — Métrica "Total de Reuniões" no Dashboard conta clientes, não reuniões

**Arquivo:** `app/(dashboard)/dashboard/page.tsx:18`

**Descrição:**  
O campo `totalMeetings` exibido no card do dashboard conta o número de **clientes que têm pelo menos uma reunião**, não o total de reuniões cadastradas no sistema. Um cliente com 10 reuniões conta como 1.

**Código atual (bugado):**
```typescript
const totalMeetings = clientsData.filter((c) => c.latestMeeting !== null).length;
```

**Correção:**  
Somar as reuniões de todos os projetos. O dado de `activeProjects` já está disponível na view, mas não o total de reuniões. A solução mais simples é adicionar um campo `total_meetings` na view `client_current_health` do Supabase, ou fazer uma query dedicada:

```typescript
// Em server/actions/clients.ts — adicionar ao getClientOverview:
const { count: totalMeetings } = await supabase
  .from("meetings")
  .select("*", { count: "exact", head: true });

// Em app/(dashboard)/dashboard/page.tsx — substituir o cálculo:
// Receber totalMeetings como retorno de getClientOverview ou query separada
```

Solução imediata sem query extra (renomear para ser honesto):
```typescript
// Se não quiser mudar a query agora, ao menos renomear para refletir a realidade:
const clientsWithMeetings = clientsData.filter((c) => c.latestMeeting !== null).length;
// E atualizar a chave de tradução para "Clientes com reunião"
```

---

### TASK-02 — Valores de completion hardcoded (92%, 68%, 40%) para projetos sem velocidade IA

**Arquivo:** `server/actions/clients.ts:188`

**Descrição:**  
Quando um projeto não possui `ai_velocity` gerado pela IA, o sistema atribui percentuais de conclusão fictícios baseados apenas no status de saúde:
- `"ok"` → 92%
- `"warning"` → 68%  
- `"critical"` → 40%

Esses valores aparecem na tabela de projetos do cliente como se fossem dados reais, enganando o usuário.

**Código atual (bugado):**
```typescript
const completion = velocityPercent ?? (healthStatus === "ok" ? 92 : healthStatus === "warning" ? 68 : 40);
```

**Correção:**
```typescript
// server/actions/clients.ts:186-196
const completion = velocityPercent ?? null;
return {
  id: p.id,
  name: p.name,
  description: p.description ?? "",
  status: p.status as ProjectStatus,
  healthStatus,
  completion,  // agora é number | null
};
```

Atualizar o tipo em `ClientDetailData`:
```typescript
// lib/types/domain.ts ou server/actions/clients.ts:141
projects: Array<{
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  healthStatus: HealthStatus;
  completion: number | null;  // null = sem dados IA
}>;
```

Atualizar o componente para exibir `—` quando `null`:
```typescript
// components/features/dashboard/client-detail-view.tsx:156-158
<td className="py-6 text-right">
  <span className="font-headline font-bold text-on-surface">
    {project.completion !== null ? `${project.completion}%` : "—"}
  </span>
</td>
```

---

### TASK-03 — Health Index do cliente hardcoded (88%, 62%, 35%) sem dados IA

**Arquivo:** `server/actions/clients.ts:201-204`

**Descrição:**  
O `healthIndex` exibido na barra de saúde do cliente usa valores inventados quando não há velocidades calculadas pela IA:
- `"ok"` → 88%
- `"warning"` → 62%
- `"critical"` → 35%

Isso cria a falsa impressão de precisão numérica quando não há dados reais.

**Código atual (bugado):**
```typescript
const healthIndex =
  velocities.length > 0
    ? Math.round(velocities.reduce((a, b) => a + b, 0) / velocities.length)
    : clientHealth === "critical" ? 35 : clientHealth === "warning" ? 62 : 88;
```

**Correção:**
```typescript
// server/actions/clients.ts:200-204
const healthIndex =
  velocities.length > 0
    ? Math.round(velocities.reduce((a, b) => a + b, 0) / velocities.length)
    : null;
```

Atualizar o tipo em `ClientDetailData`:
```typescript
healthIndex: number | null;
```

Atualizar o componente `client-detail-view.tsx` para tratar `null`:
```typescript
// components/features/dashboard/client-detail-view.tsx:88-106
{healthIndex !== null ? (
  <>
    <div className="w-full bg-surface-container-high h-4 rounded-full overflow-hidden">
      <div className={`${healthColor} h-full rounded-full`} style={{ width: `${healthIndex}%` }} />
    </div>
    <span className={`text-3xl font-black font-headline ${...}`}>{healthIndex}%</span>
  </>
) : (
  <span className="text-sm text-on-surface-variant">Dados indisponíveis — gere insights dos projetos</span>
)}
```

---

### TASK-04 — Fallback "warning" e "moderate" em reunião sem insight processado cria falso alarme

**Arquivo:** `app/(dashboard)/dashboard/clientes/[clienteId]/projetos/[projetoId]/reunioes/[reuniaoId]/page.tsx:35,45`

**Descrição:**  
Quando uma reunião tem insights registrados no banco (registro existe) mas os campos `health_status` e `temperatura.level` estão nulos (IA ainda não foi gerada), o sistema aplica fallbacks `"warning"` e `"moderate"`. Isso mostra o badge "Em risco" e temperatura "Moderada" para uma reunião que na verdade ainda não foi analisada.

**Código atual:**
```typescript
const healthStatus = insights.health_status ?? "warning";
const temperaturaLevel = insights.temperatura?.level ?? "moderate";
```

**Correção:**  
Diferenciar o estado "dados ausentes" do estado "analisado como warning". Usar `"pending"` como estado intermediário:

```typescript
// page.tsx
const healthStatus = insights.health_status ?? "pending";
const temperaturaLevel = insights.temperatura?.level ?? "pending";
```

Atualizar `HealthBadge` e `MeetingInsightView` para tratar `"pending"`:
```typescript
// components/features/dashboard/health-badge.tsx
// Adicionar case "pending":
case "pending":
  return <span className="bg-surface-container text-on-surface-variant ...">Aguardando análise</span>;
```

Alternativa mais simples — verificar se os dados essenciais existem antes de renderizar badges:
```typescript
const hasInsightData = !!insights.health_status;
const healthStatus = hasInsightData ? insights.health_status : "ok";
// Mostrar badge "Sem análise" quando !hasInsightData
```

---

### TASK-05 — Link da última reunião quebrado quando vem da view `client_current_health`

**Arquivo:** `server/actions/clients.ts:112-120`

**Descrição:**  
O fallback que usa `row.last_meeting_date` da view `client_current_health` (quando nenhum projeto tem `latest_meeting_date`) cria um objeto `Meeting` com `id: ""` e `project_id: ""`. Se esse objeto for usado para construir um link de navegação, o resultado será uma URL inválida como `/dashboard/clientes/xxx/projetos//reunioes/`.

**Código atual:**
```typescript
} else if (row.last_meeting_date) {
  latestMeeting = {
    id: "",           // ID vazio!
    project_id: "",   // project_id vazio!
    meeting_date: row.last_meeting_date,
    title: "",
    created_at: row.last_meeting_date,
  };
}
```

**Correção:**
```typescript
// Não criar o objeto se não temos os dados necessários para navegação
} else if (row.last_meeting_date) {
  // Sem meeting_id disponível — não incluir para evitar link quebrado
  latestMeeting = null;
}
```

Se quiser manter a data sem navegação, criar um tipo separado:
```typescript
latestMeetingDate: row.last_meeting_date ?? null,  // só para exibição
latestMeeting: null,  // null = sem link navegável
```

---

### TASK-06 — `health_status` de nova reunião é hardcoded como `"ok"` no insert

**Arquivo:** `server/actions/meetings.ts:36-43`

**Descrição:**  
Ao criar uma reunião, o sistema insere automaticamente um registro em `meeting_insights` com `health_status: "ok"`. Isso faz a reunião aparecer como "saudável" mesmo antes de qualquer análise ser feita pela IA.

**Código atual:**
```typescript
const { error: insightErr } = await supabase.from("meeting_insights").insert({
  meeting_id: meeting.id,
  health_status: "ok",  // hardcoded!
});
```

**Correção:**  
Não criar o insight automaticamente, ou criar com status nulo:
```typescript
// Opção 1: não criar o registro (melhor semântica — só existe quando IA processou)
// Remover o insert automático de meeting_insights

// Opção 2: criar com status null para indicar "não processado"
// Requer que a coluna health_status aceite NULL no banco
const { error: insightErr } = await supabase.from("meeting_insights").insert({
  meeting_id: meeting.id,
  health_status: null,
});
```

O componente de listagem de reuniões já trata o fallback:
```typescript
// projects.ts:119
healthStatus: healthByMeeting.get(m.id) ?? "ok",
```
Esse fallback também deve ser mudado para `null` ou `"pending"` consistentemente.

---

## ALTAS — Corrigir em breve

---

### TASK-07 — `lang` da tag `<html>` hardcoded como `pt-BR`, nunca muda para EN

**Arquivo:** `app/layout.tsx:39`

**Descrição:**  
O atributo `lang` do elemento HTML raiz é sempre `"pt-BR"`, independente do idioma selecionado pelo usuário. Isso afeta acessibilidade (leitores de tela pronunciam palavras inglesas com sotaque português) e SEO.

**Código atual:**
```tsx
<html lang="pt-BR" suppressHydrationWarning>
```

**Problema:** `RootLayout` é um Server Component e não tem acesso ao contexto de idioma do cliente. O `LanguageProvider` está dentro do `body`, então o `lang` da `html` não pode ser atualizado pelo React no lado do cliente da forma habitual.

**Correção — via cookie SSR:**
```typescript
// app/layout.tsx
import { cookies } from "next/headers";

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value === "en" ? "en" : "pt-BR";
  
  return (
    <html lang={lang} suppressHydrationWarning>
```

No `LanguageProvider`, persistir a mudança em cookie:
```typescript
// lib/i18n/language-context.tsx
const setLang = (newLang: Lang) => {
  setLangState(newLang);
  document.cookie = `lang=${newLang};path=/;max-age=31536000`;
  // Atualizar o atributo diretamente para esta sessão:
  document.documentElement.lang = newLang === "pt" ? "pt-BR" : "en";
};
```

---

### TASK-08 — "Gestores" não traduzido para inglês no painel Admin

**Arquivo:** `lib/i18n/translations.ts:470`

**Descrição:**  
A chave `admin_gestores` na seção `en` mantém o valor em português `"Gestores"` ao invés de `"Managers"`.

**Código atual:**
```typescript
en: {
  // ...
  admin_gestores: "Gestores",  // deveria ser "Managers"
```

**Correção:**
```typescript
// lib/i18n/translations.ts — seção en:
admin_gestores: "Managers",
```

---

### TASK-09 — Chaves de tradução com textos de exemplo ainda presentes na produção

**Arquivo:** `lib/i18n/translations.ts:119-146`

**Descrição:**  
Diversas chaves de tradução contêm textos de exemplo/placeholder que foram criados durante o desenvolvimento mas nunca foram removidos ou substituídos. Se algum componente ainda referenciar essas chaves como fallback, o usuário verá conteúdo fictício. As chaves identificadas:

- `proj_mock_milestone_name: "Corte de migração do banco"` — nome de marco fictício
- `proj_ai_insight_body: "O delta da migração sugere..."` — insight fictício  
- `proj_ai_action_1: "Realinhar restrições de arquitetura..."` — ação fictícia
- `proj_ai_action_2: "Tratar backlog de segurança..."` — ação fictícia
- `proj_action_api_freeze`, `proj_action_compliance`, `proj_action_cloud_audit` — ações fictícias
- `proj_due_2_days`, `proj_due_5_days`, `proj_due_8_days` — prazos fictícios
- `proj_resource_burn_body: "...12% abaixo do orçamento..."` — dado fictício (componente não usa mais)

**Verificar uso:**
```bash
grep -rn "proj_mock_milestone_name\|proj_ai_insight_body\|proj_ai_action_1\|proj_ai_action_2\|proj_action_api_freeze\|proj_resource_burn_body" components/ app/
```

**Correção:**  
Remover as chaves não utilizadas. Para as que forem usadas como fallback, substituir por mensagens genéricas informando que o dado será gerado pela IA:
```typescript
// Remover:
proj_mock_milestone_name, proj_ai_insight_body, proj_ai_action_1, proj_ai_action_2,
proj_action_api_freeze, proj_action_compliance, proj_action_cloud_audit,
proj_due_2_days, proj_due_5_days, proj_due_8_days, proj_resource_burn_body
```

---

### TASK-10 — 3 queries separadas por pageload na visão geral do dashboard (N+1)

**Arquivo:** `server/actions/clients.ts:42-88`

**Descrição:**  
A função `getClientOverview()` executa 3 queries independentes ao Supabase para montar a página inicial do dashboard:
1. `client_current_health` — view com saúde atual
2. `clients` — para buscar `created_at` dos clientes
3. `project_current_health` — view com saúde dos projetos

Esse padrão tem custo adicional de latência (3 round-trips) e não escalará bem.

**Correção — unificar via view no Supabase:**

Criar uma nova view `clients_dashboard_overview` que já inclua `created_at`:
```sql
-- supabase/migrations/XXXX_clients_dashboard_overview.sql
CREATE OR REPLACE VIEW clients_dashboard_overview AS
SELECT
  c.id AS client_id,
  c.code,
  c.name,
  c.status AS client_status,
  c.created_at,
  cch.health_status,
  cch.active_projects,
  cch.last_meeting_date
FROM clients c
LEFT JOIN client_current_health cch ON cch.client_id = c.id;
```

Ou simplesmente incluir `created_at` na view `client_current_health` existente e eliminar a query extra de `clients`.

Para `project_current_health`, manter a query separada mas fazer as duas em paralelo:
```typescript
const [healthResult, pchResult] = await Promise.all([
  supabase.from("client_current_health").select("*, clients(created_at)").order("name"),
  supabase.from("project_current_health").select("*").in("client_id", clientIds),
]);
```

---

### TASK-11 — Reuniões carregadas sem paginação — risco de timeout em projetos antigos

**Arquivo:** `server/actions/projects.ts:97-120`

**Descrição:**  
`getProjectMeetings()` carrega **todas** as reuniões de um projeto sem nenhum limite. Um projeto com anos de histórico pode ter centenas de reuniões, causando payload grande e lentidão.

**Código atual:**
```typescript
const { data: meetings } = await supabase
  .from("meetings")
  .select("id, meeting_date, title, project_id, created_at")
  .eq("project_id", projectId)
  .order("meeting_date", { ascending: false });
  // sem .limit()!
```

**Correção — adicionar paginação:**
```typescript
// server/actions/projects.ts
const PAGE_SIZE = 30;

export async function getProjectMeetings(projectId: string, page = 0): Promise<MeetingRow[]> {
  const supabase = await createClient();
  const { data: meetings } = await supabase
    .from("meetings")
    .select("id, meeting_date, title, project_id, created_at")
    .eq("project_id", projectId)
    .order("meeting_date", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
  // ... resto da função
```

No componente, implementar "Ver mais" ou scroll infinito para carregar próximas páginas.

---

### TASK-12 — Contexto da IA carrega TODAS as reuniões do projeto sem limite

**Arquivo:** `server/lib/project-ai-context.ts:106-128`

**Descrição:**  
`loadMeetingsForProjectAi()` carrega todas as reuniões do projeto para construir o contexto enviado à IA. Projetos antigos com muitas reuniões gerarão contextos enormes, aumentando custo de tokens e tempo de resposta.

**Código atual:**
```typescript
const { data: meetingRows } = await supabase
  .from("meetings")
  .select(`title, meeting_date, raw_notes, meeting_insights (...)`)
  .eq("project_id", projectId)
  .order("meeting_date", { ascending: false });
  // sem limite!
```

O truncamento em `MAX_CONTEXT_CHARS = 14_000` corta o texto mas ainda carrega tudo do banco.

**Correção:**
```typescript
// server/lib/project-ai-context.ts
const MAX_MEETINGS_FOR_AI = 10; // apenas reuniões mais recentes

const { data: meetingRows } = await supabase
  .from("meetings")
  .select(`title, meeting_date, raw_notes, meeting_insights (...)`)
  .eq("project_id", projectId)
  .order("meeting_date", { ascending: false })
  .limit(MAX_MEETINGS_FOR_AI);
```

---

### TASK-13 — Contexto de reuniões carregado duas vezes para insight + velocidade

**Arquivo:** `server/lib/project-strategic-insight.ts:49` e `server/lib/project-velocity.ts:68`

**Descrição:**  
Ao gerar insights de reunião (`generateInsightsAction`), o fluxo é:
1. `regenerateProjectStrategicInsight` → chama `loadMeetingsForProjectAi` (query ao banco)
2. Depois chama `regenerateProjectVelocity` → chama `loadMeetingsForProjectAi` novamente (segunda query ao banco idêntica)

Isso dobra o número de queries e o tempo de resposta.

**Correção:**  
Refatorar para passar o contexto já carregado:

```typescript
// server/lib/project-strategic-insight.ts
export async function regenerateProjectStrategicInsight(
  projectId: string,
  preloadedMeetings?: MeetingForAiContext[]  // opcional
): Promise<RegenerateProjectStrategicInsightResult> {
  const supabase = await createClient();
  // ...
  const meetings = preloadedMeetings ?? (await loadMeetingsForProjectAi(supabase, projectId)).meetings;
  const context = buildProjectAiContextString({ projectName: project.name, projectDescription: project.description, meetings });
  
  // ... gerar insight ...
  
  // Passar meetings já carregados para velocity:
  const vel = await regenerateProjectVelocity(projectId, meetings);
```

```typescript
// server/lib/project-velocity.ts
export async function regenerateProjectVelocity(
  projectId: string,
  preloadedMeetings?: MeetingForAiContext[]
): Promise<RegenerateProjectVelocityResult> {
  const supabase = await createClient();
  const loaded = preloadedMeetings
    ? { ok: true as const, meetings: preloadedMeetings }
    : await loadMeetingsForProjectAi(supabase, projectId);
```

---

### TASK-14 — Seção "Gerente de conta / Valor do contrato / Data de renovação" sempre exibe TBD

**Arquivo:** `components/features/dashboard/client-detail-view.tsx:201-225`

**Descrição:**  
A seção "Visão do relacionamento" exibe três campos sempre como "A definir" (TBD) porque os dados não existem no banco. Pior: "Data de renovação" usa `text-error` (cor vermelha) como se fosse um alerta urgente.

**Correção — opção A: remover a seção até ter os dados:**
```typescript
// Remover o bloco inteiro da seção "Visão do relacionamento" até o banco ter essas colunas
```

**Correção — opção B: adicionar colunas ao banco e conectar:**
```sql
-- supabase/migrations/XXXX_clients_engagement.sql
ALTER TABLE clients ADD COLUMN key_account_manager TEXT;
ALTER TABLE clients ADD COLUMN contract_value TEXT;
ALTER TABLE clients ADD COLUMN renewal_date DATE;
```

Atualizar `getClientDetail` para retornar esses campos e exibi-los no componente.

**Fix imediato — remover a cor de erro do TBD:**
```typescript
// client-detail-view.tsx:224 — mudar de text-error para text-on-surface-variant
<span className="text-sm font-semibold text-on-surface-variant">
  {t("client_detail_tbd")}
</span>
```

---

### TASK-15 — Botão "Editar Projeto" sem função implementada

**Arquivo:** `components/features/dashboard/project-detail-view.tsx:158-165`

**Descrição:**  
O botão de edição do projeto está renderizado na UI mas não tem `onClick` nem navega para nenhuma rota. Ao clicar, não acontece nada — o usuário fica confuso.

**Código atual:**
```tsx
<Button
  type="button"
  variant="outline"
  size="icon"
  // sem onClick!
  title={t("proj_edit")}
>
  <Edit className="w-5 h-5" />
</Button>
```

**Correção — opção A: redirecionar para página de edição:**
```typescript
// Adicionar onClick com router.push ou transformar em Link
import { useRouter } from "next/navigation";
const router = useRouter();

<Button
  onClick={() => router.push(`/dashboard/clientes/${clienteId}/projetos/${projetoId}/editar`)}
  ...
>
```

**Correção — opção B: desabilitar até implementar:**
```tsx
<Button disabled title="Em breve" ...>
```

**Correção — opção C: remover até implementar:**
```typescript
// Remover o botão completamente enquanto não há a feature
```

---

## MÉDIAS — Planejar para próxima sprint

---

### TASK-16 — Seção "Próximo Marco" comentada no projeto — feature incompleta visível

**Arquivo:** `components/features/dashboard/project-detail-view.tsx:225-239`

**Descrição:**  
O card "Próximo Marco" está comentado com `{/* ... */}`. Código morto comentado polui o arquivo e confunde desenvolvedores sobre o estado da feature.

**Código atual:**
```tsx
{/*{strategicInsight?.upcoming_actions && strategicInsight.upcoming_actions.length > 0 && (
  <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4">
    ...
  </div>
)}*/}
```

**Correção:**  
Descomente e finalize a feature (os dados já existem em `strategicInsight.upcoming_actions`), ou remova completamente o bloco comentado. A seção "Próximas ações" na coluna direita já exibe `upcoming_actions` — o milestone card seria redundante.

```typescript
// Remover o bloco comentado inteiro (linhas 225-239)
// A feature já está implementada na seção "Próximas ações" (linha 372+)
```

---

### TASK-17 — `created_at` do cliente usa data atual como fallback incorreto

**Arquivo:** `server/actions/clients.ts:97-98`

**Descrição:**  
Quando o mapa de `created_at` dos clientes não tem o ID, o sistema usa `new Date().toISOString()` (agora) como fallback. Se o campo for exibido ao usuário, mostrará a data/hora atual como data de criação do cliente.

**Código atual:**
```typescript
created_at: createdMap.get(row.client_id) ?? new Date().toISOString(),
```

**Correção:**  
Usar `null` ou string vazia, e tratar no componente:
```typescript
created_at: createdMap.get(row.client_id) ?? "",
```

Melhor solução: incluir `created_at` diretamente na view `client_current_health` do Supabase, eliminando a necessidade da segunda query.

---

### TASK-18 — Favicon com URL externa do LinkedIn CDN com token temporário

**Arquivo:** `app/layout.tsx:21`

**Descrição:**  
O favicon é carregado de uma URL do LinkedIn CDN que contém parâmetros de expiração (`e=1776902400`). Após a expiração, o favicon deixará de carregar. Além disso, cada carregamento de página faz uma request externa ao LinkedIn.

**Código atual:**
```typescript
const faviconUrl = "https://media.licdn.com/dms/image/v2/...?e=1776902400&v=beta&t=...";
```

**Correção:**  
Baixar o favicon e hospedá-lo localmente:
```bash
# Baixar a imagem e salvar em /public/favicon.png
```

```typescript
// app/layout.tsx
const faviconUrl = "/favicon.png";
// ou usar next/image com o arquivo local
```

---

### TASK-19 — Link "Ver histórico completo de reuniões" na página de cliente aponta para reunião, não histórico

**Arquivo:** `components/features/dashboard/client-detail-view.tsx:184-190`

**Descrição:**  
O link "Ver histórico completo de reuniões" navega para a **página da reunião específica** (a última reunião), não para o histórico de reuniões do projeto.

**Código atual:**
```typescript
href={`/dashboard/clientes/${clienteId}/projetos/${latestMeeting.project_id}/reunioes/${latestMeeting.id}`}
```

**Comportamento esperado:** navegar para a página do projeto, onde está listado o histórico de reuniões.

**Correção:**
```typescript
href={`/dashboard/clientes/${clienteId}/projetos/${latestMeeting.project_id}`}
```

Renomear o texto do link para ser mais preciso:
```typescript
// ou manter o link para a última reunião e trocar o texto para:
t("client_detail_view_latest_meeting")  // "Ver última reunião"
// e adicionar uma chave de tradução
```

---

### TASK-20 — Oportunidade IA: campos "Gerente de conta" e "Valor do contrato" podem ser inferidos via OpenRouter

**Arquivo:** `components/features/dashboard/client-detail-view.tsx:201-224` e `server/actions/clients.ts`

**Descrição:**  
Os campos de relacionamento com o cliente (gerente, valor, renovação) existem na UI mas sempre mostram TBD. Uma oportunidade é inferir essas informações a partir das notas das reuniões usando OpenRouter.

**Implementação sugerida:**  
Adicionar um novo endpoint de IA que analisa as reuniões do cliente e extrai/infere:
- Nomes mencionados como responsáveis ou líderes (→ Key Account Manager)
- Valores ou faixas de investimento mencionadas (→ Contract Value)  
- Prazos ou datas de entrega finais (→ Renewal/End Date)

```typescript
// server/lib/client-engagement-insight.ts (novo arquivo)
export async function inferClientEngagement(clientId: string) {
  const supabase = await createClient();
  // Carregar últimas N reuniões do cliente
  // Prompt: "Extraia do contexto abaixo: 1) nome do responsável principal pelo cliente,
  //          2) valor ou faixa do projeto se mencionado, 3) data final/renovação se mencionada."
  // Retornar JSON: { key_account: string|null, contract_value: string|null, end_date: string|null }
}
```

---

### TASK-21 — Oportunidade IA: gerar descrição automática para novos clientes via OpenRouter

**Arquivo:** `server/actions/clients.ts:236-257`

**Descrição:**  
Ao criar um cliente, apenas `code`, `name` e `status` são salvos. A descrição/hero text da página do cliente é sempre um placeholder genérico. A IA poderia gerar uma descrição inicial baseada no nome e setor da empresa.

**Implementação sugerida:**
```typescript
// server/actions/clients.ts — em createClientAction:
export async function createClientAction(data: CreateClientInput) {
  // ... validação e insert existente ...
  
  // Após o insert, gerar descrição com IA em background (não bloquear a resposta):
  if (parsed.data.industry) {  // se campo indústria for adicionado
    generateClientDescription(client.id, parsed.data.name, parsed.data.industry)
      .catch(err => console.warn("[createClient] Falha ao gerar descrição:", err));
  }
  
  return { error: null };
}
```

---

## BAIXAS / MELHORIAS FUTURAS

---

### TASK-22 — Rate limiting ausente no endpoint de geração de insights IA

**Arquivo:** `server/actions/ai-insights.ts:115-182`

**Descrição:**  
Não há proteção contra spam de cliques no botão "Gerar Insights". Um usuário pode chamar `generateInsightsAction` repetidamente, gerando múltiplas chamadas à API OpenRouter e aumentando o custo sem necessidade.

**Correção sugerida:**  
Adicionar verificação de timestamp do último insight gerado:
```typescript
// No início de generateInsightsAction:
const { data: existingInsight } = await supabase
  .from("meeting_insights")
  .select("updated_at")
  .eq("meeting_id", meetingId)
  .maybeSingle();

const COOLDOWN_SECONDS = 30;
if (existingInsight?.updated_at) {
  const secondsSinceLast = (Date.now() - new Date(existingInsight.updated_at).getTime()) / 1000;
  if (secondsSinceLast < COOLDOWN_SECONDS) {
    return { error: `Aguarde ${Math.ceil(COOLDOWN_SECONDS - secondsSinceLast)}s antes de gerar novamente.` };
  }
}
```

---

## Checklist de Implementação

| # | Task | Arquivo Principal | Prioridade | Status |
|---|------|------------------|------------|--------|
| TASK-01 | Corrigir contagem de totalMeetings | `app/(dashboard)/dashboard/page.tsx` | 🔴 Crítica | ✅ |
| TASK-02 | Remover fallback hardcoded 92/68/40% | `server/actions/clients.ts:188` | 🔴 Crítica | ✅ |
| TASK-03 | Remover health index hardcoded 88/62/35% | `server/actions/clients.ts:201` | 🔴 Crítica | ✅ |
| TASK-04 | Corrigir fallback "warning" em reunião sem IA | `app/.../reunioes/[reuniaoId]/page.tsx:35` | 🔴 Crítica | ✅ |
| TASK-05 | Corrigir link quebrado de última reunião | `server/actions/clients.ts:112` | 🔴 Crítica | ✅ |
| TASK-06 | Remover health_status hardcoded no insert | `server/actions/meetings.ts:38` | 🔴 Crítica | ✅ |
| TASK-07 | Corrigir `lang` do HTML raiz | `app/layout.tsx:39` | 🟠 Alta | ⬜ |
| TASK-08 | Traduzir "Gestores" para EN | `lib/i18n/translations.ts:470` | 🟠 Alta | ⬜ |
| TASK-09 | Remover chaves de tradução fictícias | `lib/i18n/translations.ts` | 🟠 Alta | ⬜ |
| TASK-10 | Unificar 3 queries do dashboard overview | `server/actions/clients.ts:42` | 🟠 Alta | ⬜ |
| TASK-11 | Adicionar paginação em reuniões | `server/actions/projects.ts:97` | 🟠 Alta | ⬜ |
| TASK-12 | Limitar reuniões carregadas para IA | `server/lib/project-ai-context.ts:106` | 🟠 Alta | ⬜ |
| TASK-13 | Evitar dupla carga de contexto (insight + velocity) | `server/lib/project-strategic-insight.ts` | 🟠 Alta | ⬜ |
| TASK-14 | Remover/conectar campos TBD do relacionamento | `components/.../client-detail-view.tsx:201` | 🟠 Alta | ⬜ |
| TASK-15 | Implementar ou remover botão "Editar Projeto" | `components/.../project-detail-view.tsx:158` | 🟠 Alta | ⬜ |
| TASK-16 | Remover código comentado do Próximo Marco | `components/.../project-detail-view.tsx:225` | 🟡 Média | ⬜ |
| TASK-17 | Corrigir fallback `created_at` com data atual | `server/actions/clients.ts:97` | 🟡 Média | ⬜ |
| TASK-18 | Mover favicon para hospedagem local | `app/layout.tsx:21` | 🟡 Média | ⬜ |
| TASK-19 | Corrigir link "Ver histórico de reuniões" | `components/.../client-detail-view.tsx:184` | 🟡 Média | ⬜ |
| TASK-20 | IA: inferir campos de relacionamento via OpenRouter | `server/actions/clients.ts` | 🟡 Média | ⬜ |
| TASK-21 | IA: gerar descrição automática de cliente | `server/lib/client-description.ts` | 🔵 Baixa | ✅ |
| TASK-22 | Rate limiting na geração de insights | `server/actions/ai-insights.ts:115` | 🔵 Baixa | ✅ |
