import { createClient } from "@/lib/supabase/server";
import {
  projectStrategicInsightPayloadSchema,
  type ProjectStrategicInsightPayload,
} from "@/lib/schemas/project-strategic-insight";
import { buildProjectAiContextString, loadMeetingsForProjectAi } from "@/server/lib/project-ai-context";
import { regenerateProjectVelocity } from "@/server/lib/project-velocity";
import { callOpenRouter, parseOpenRouterJson } from "@/server/lib/openrouter";

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

    const aiResult = await callOpenRouter({
      messages: [{ role: "user", content: buildPrompt(context) }],
      temperature: 0.35,
    });

    if (!aiResult.ok) {
      console.error("[project-strategic-insight] OpenRouter:", aiResult.error);
      return { error: aiResult.error };
    }

    const jsonResult = parseOpenRouterJson<unknown>(aiResult.content);
    if (!jsonResult.ok) return { error: jsonResult.error };

    const parsed = projectStrategicInsightPayloadSchema.safeParse(jsonResult.data);
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

    const vel = await regenerateProjectVelocity(projectId, loaded.meetings);
    if (vel.error) {
      console.warn("[project-strategic-insight] Velocidade não atualizada:", vel.error);
    }

    return { error: null };
  } catch (e) {
    console.error("[project-strategic-insight]", e);
    return { error: e instanceof Error ? e.message : "Falha ao gerar insight." };
  }
}
