import { createClient } from "@/lib/supabase/server";
import {
  projectStrategicInsightPayloadSchema,
  type ProjectStrategicInsightPayload,
} from "@/lib/schemas/project-strategic-insight";
import { buildProjectAiContextString, loadMeetingsForProjectAi } from "@/server/lib/project-ai-context";
import { regenerateProjectVelocity } from "@/server/lib/project-velocity";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4.1-mini";

function buildPrompt(context: string): string {
  return `Você é consultor sênior em projetos de inovação. Com base EXCLUSIVAMENTE nos dados abaixo sobre o projeto e suas reuniões, produza um insight estratégico único: visão do momento do projeto, tensões e próximos passos sugeridos.

DADOS:
${context}

Regras:
- Não invente fatos ausentes dos dados.
- Português do Brasil, tom profissional e direto.
- "tag" deve ser um rótulo curto (2–5 palavras) para o tema central (ex.: risco de escopo, alinhamento técnico).
- "actions" deve ter 2 a 3 itens concretos e curtos (visão geral do painel de insight).
- "upcoming_actions": lista de 2 a 5 itens para a coluna "Próximas ações", derivada APENAS dos blocos COMPROMISSOS e AUDITOR DE ENTREGAS acima. Priorize pendências, prazos próximos e status não concluído. Cada item: "title" (texto curto) e opcionalmente "due_hint" (prazo ou lembrete, só se constar nos dados). Se não houver compromissos nem entregas nos dados, use array vazio [].

Retorne APENAS um JSON válido (sem markdown), neste formato exato:
{"body":"2 a 4 frases","tag":"rótulo curto","actions":["ação 1","ação 2"],"upcoming_actions":[{"title":"texto","due_hint":"opcional"}]}`;
}

export type RegenerateProjectStrategicInsightResult = { error: string | null };

/**
 * Recomputa e persiste o insight estratégico do projeto em `projects.ai_strategic_insight` (OpenRouter).
 * Também atualiza `projects.ai_velocity` com o mesmo contexto de reuniões.
 */
export async function regenerateProjectStrategicInsight(
  projectId: string
): Promise<RegenerateProjectStrategicInsightResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { error: "Chave da API OpenRouter não configurada." };
  }

  try {
    const supabase = await createClient();

    const { data: project, error: pErr } = await supabase
      .from("projects")
      .select("id, name, description")
      .eq("id", projectId)
      .single();

    if (pErr || !project) {
      return { error: "Projeto não encontrado." };
    }

    const loaded = await loadMeetingsForProjectAi(supabase, projectId);
    if (!loaded.ok) {
      return { error: loaded.error };
    }
    if (!loaded.meetings.length) {
      return { error: "Não há reuniões neste projeto para gerar o insight." };
    }

    const context = buildProjectAiContextString({
      projectName: project.name,
      projectDescription: project.description,
      meetings: loaded.meetings,
    });

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://innovationlatam.com",
        "X-Title": "Innovation Latam Dashboard",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: buildPrompt(context) }],
        response_format: { type: "json_object" },
        temperature: 0.35,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[project-strategic-insight] OpenRouter:", errText);
      return { error: `Erro na API OpenRouter: ${response.status}` };
    }

    const json = await response.json();
    const rawJson = json?.choices?.[0]?.message?.content ?? "";
    let data: unknown;
    try {
      data = JSON.parse(rawJson);
    } catch {
      return { error: "Resposta da IA não é um JSON válido." };
    }

    const parsed = projectStrategicInsightPayloadSchema.safeParse(data);
    if (!parsed.success) {
      return { error: `Resposta da IA em formato inesperado: ${parsed.error.errors[0]?.message ?? "inválido"}` };
    }

    const payload: ProjectStrategicInsightPayload = parsed.data;

    const { error: upErr } = await supabase
      .from("projects")
      .update({
        ai_strategic_insight: payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (upErr) {
      return { error: upErr.message };
    }

    const vel = await regenerateProjectVelocity(projectId);
    if (vel.error) {
      console.warn("[project-strategic-insight] Velocidade não atualizada:", vel.error);
    }

    return { error: null };
  } catch (e) {
    console.error("[project-strategic-insight]", e);
    return { error: e instanceof Error ? e.message : "Falha ao gerar insight." };
  }
}
