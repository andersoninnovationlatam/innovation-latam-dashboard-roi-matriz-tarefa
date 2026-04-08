import { createClient } from "@/lib/supabase/server";
import {
  projectVelocityAiResponseSchema,
  projectVelocityPayloadSchema,
  type ProjectVelocityPayload,
} from "@/lib/schemas/project-velocity";
import { buildProjectAiContextString, loadMeetingsForProjectAi } from "@/server/lib/project-ai-context";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4.1-mini";

function buildVelocityPrompt(context: string): string {
  return `Você é consultor sênior em projetos de inovação. Com base EXCLUSIVAMENTE nos dados abaixo, estime a "velocidade do projeto" como um único número inteiro de 0 a 100.

Interpretação (use evidências dos dados; não invente fatos ausentes):
- 90–100: ritmo forte, entregas/compromissos majoritariamente em dia, saúde ok, poucos bloqueios.
- 60–89: avanço moderado, alguns atrasos ou riscos gerenciáveis.
- 30–59: desaceleração clara, várias pendências, saúde warning ou bloqueios recorrentes.
- 0–29: risco alto, paralisação, critical, ou dados indicam forte impedimento ao ritmo.

DADOS:
${context}

Retorne APENAS um JSON válido (sem markdown), neste formato exato:
{"percent": <inteiro de 0 a 100>}`;
}

export type RegenerateProjectVelocityResult = {
  error: string | null;
  payload: ProjectVelocityPayload | null;
};

/**
 * Gera e persiste `projects.ai_velocity` via OpenRouter (mesmo contexto das reuniões do insight estratégico).
 */
export async function regenerateProjectVelocity(
  projectId: string
): Promise<RegenerateProjectVelocityResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { error: "Chave da API OpenRouter não configurada.", payload: null };
  }

  try {
    const supabase = await createClient();

    const { data: project, error: pErr } = await supabase
      .from("projects")
      .select("id, name, description")
      .eq("id", projectId)
      .single();

    if (pErr || !project) {
      return { error: "Projeto não encontrado.", payload: null };
    }

    const loaded = await loadMeetingsForProjectAi(supabase, projectId);
    if (!loaded.ok) {
      return { error: loaded.error, payload: null };
    }
    if (!loaded.meetings.length) {
      return { error: "Não há reuniões neste projeto para estimar a velocidade.", payload: null };
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
        messages: [{ role: "user", content: buildVelocityPrompt(context) }],
        response_format: { type: "json_object" },
        temperature: 0.25,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[project-velocity] OpenRouter:", errText);
      return { error: `Erro na API OpenRouter: ${response.status}`, payload: null };
    }

    const json = await response.json();
    const rawJson = json?.choices?.[0]?.message?.content ?? "";
    let data: unknown;
    try {
      data = JSON.parse(rawJson);
    } catch {
      return { error: "Resposta da IA não é um JSON válido.", payload: null };
    }

    const parsedAi = projectVelocityAiResponseSchema.safeParse(data);
    if (!parsedAi.success) {
      return {
        error: `Resposta da IA em formato inesperado: ${parsedAi.error.errors[0]?.message ?? "inválido"}`,
        payload: null,
      };
    }

    const generatedAt = new Date().toISOString();
    const payload: ProjectVelocityPayload = {
      percent: parsedAi.data.percent,
      generated_at: generatedAt,
    };

    const validated = projectVelocityPayloadSchema.safeParse(payload);
    if (!validated.success) {
      return { error: "Payload de velocidade inválido.", payload: null };
    }

    const { error: upErr } = await supabase
      .from("projects")
      .update({
        ai_velocity: validated.data,
        updated_at: generatedAt,
      })
      .eq("id", projectId);

    if (upErr) {
      return { error: upErr.message, payload: null };
    }

    return { error: null, payload: validated.data };
  } catch (e) {
    console.error("[project-velocity]", e);
    return {
      error: e instanceof Error ? e.message : "Falha ao gerar velocidade.",
      payload: null,
    };
  }
}
