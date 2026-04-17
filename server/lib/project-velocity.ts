import { createClient } from "@/lib/supabase/server";
import {
  projectVelocityAiResponseSchema,
  projectVelocityPayloadSchema,
  type ProjectVelocityPayload,
} from "@/lib/schemas/project-velocity";
import {
  buildProjectAiContextString,
  loadMeetingsForProjectAi,
  type MeetingForAiContext,
} from "@/server/lib/project-ai-context";
import { callOpenRouter, parseOpenRouterJson } from "@/server/lib/openrouter";

function buildVelocityPrompt(context: string): string {
  return `Você é consultor sênior em projetos de inovação. Com base EXCLUSIVAMENTE nos dados abaixo, avalie 5 dimensões do projeto e retorne um JSON com exatamente os campos especificados. Não invente fatos ausentes — se não houver evidência, use null.

DADOS:
${context}

Campos a retornar:

1. percent (inteiro 0–100): velocidade geral do projeto.
   - 90–100: ritmo forte, entregas/compromissos em dia, saúde ok, poucos bloqueios.
   - 60–89: avanço moderado, alguns atrasos ou riscos gerenciáveis.
   - 30–59: desaceleração clara, várias pendências, saúde warning ou bloqueios recorrentes.
   - 0–29: risco alto, paralisação, critical ou forte impedimento ao ritmo.

2. architecture_readiness (inteiro 0–100): maturidade técnica/arquitetural.
   - 80–100: stack clara, sem débito técnico crítico, integrações estáveis.
   - 50–79: preocupações técnicas gerenciáveis, débitos não críticos.
   - 0–49: bloqueios técnicos graves, débito alto, integrações instáveis.
   Se não houver menção de aspectos técnicos nas notas, use 50 como valor neutro.

3. burn_rate_label (string): ritmo de consumo de recursos vs. entregas.
   Valores possíveis: "Otimizada" | "Moderada" | "Elevada"
   - "Otimizada": entregas em dia, poucos bloqueios, equipe eficiente.
   - "Moderada": entregas com atrasos pontuais ou alguns bloqueios gerenciáveis.
   - "Elevada": atrasos recorrentes, muitas pendências, equipe sobrecarregada.

4. active_resources (inteiro ou null): estimativa de pessoas ativamente engajadas mencionadas nas notas (ex: participantes de reuniões, nomes citados). Retorne null se não houver dados suficientes.

5. total_resources (inteiro ou null): estimativa total de pessoas alocadas ao projeto mencionadas nas notas. Retorne null se não houver dados suficientes. Se active_resources for null, este também deve ser null.

Retorne APENAS um JSON válido (sem markdown), neste formato exato:
{"percent": <inteiro>, "architecture_readiness": <inteiro>, "burn_rate_label": "<string>", "active_resources": <inteiro ou null>, "total_resources": <inteiro ou null>}`;
}

export type RegenerateProjectVelocityResult = {
  error: string | null;
  payload: ProjectVelocityPayload | null;
};

/**
 * Gera e persiste `projects.ai_velocity` via OpenRouter (mesmo contexto das reuniões do insight estratégico).
 */
export async function regenerateProjectVelocity(
  projectId: string,
  preloadedMeetings?: MeetingForAiContext[]
): Promise<RegenerateProjectVelocityResult> {
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

    let meetings: MeetingForAiContext[];
    if (preloadedMeetings) {
      meetings = preloadedMeetings;
    } else {
      const loaded = await loadMeetingsForProjectAi(supabase, projectId);
      if (!loaded.ok) return { error: loaded.error, payload: null };
      meetings = loaded.meetings;
    }

    if (!meetings.length) {
      return { error: "Não há reuniões neste projeto para estimar a velocidade.", payload: null };
    }

    const context = buildProjectAiContextString({
      projectName: project.name,
      projectDescription: project.description,
      meetings,
    });

    const aiResult = await callOpenRouter({
      messages: [{ role: "user", content: buildVelocityPrompt(context) }],
      temperature: 0.25,
    });

    if (!aiResult.ok) {
      console.error("[project-velocity] OpenRouter:", aiResult.error);
      return { error: aiResult.error, payload: null };
    }

    const jsonResult = parseOpenRouterJson<unknown>(aiResult.content);
    if (!jsonResult.ok) return { error: jsonResult.error, payload: null };

    const parsedAi = projectVelocityAiResponseSchema.safeParse(jsonResult.data);
    if (!parsedAi.success) {
      return {
        error: `Resposta da IA em formato inesperado: ${parsedAi.error.errors[0]?.message ?? "inválido"}`,
        payload: null,
      };
    }

    const generatedAt = new Date().toISOString();
    const payload: ProjectVelocityPayload = {
      percent: parsedAi.data.percent,
      architecture_readiness: parsedAi.data.architecture_readiness ?? null,
      burn_rate_label: parsedAi.data.burn_rate_label ?? null,
      active_resources: parsedAi.data.active_resources ?? null,
      total_resources: parsedAi.data.total_resources ?? null,
      generated_at: generatedAt,
    };

    const validated = projectVelocityPayloadSchema.safeParse(payload);
    if (!validated.success) {
      return { error: "Payload de velocidade inválido.", payload: null };
    }

    const { error: upErr } = await supabase
      .from("projects")
      .update({ ai_velocity: validated.data, updated_at: generatedAt })
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
