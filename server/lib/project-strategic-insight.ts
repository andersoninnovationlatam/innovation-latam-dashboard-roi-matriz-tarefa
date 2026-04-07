import { createClient } from "@/lib/supabase/server";
import {
  projectStrategicInsightPayloadSchema,
  type ProjectStrategicInsightPayload,
} from "@/lib/schemas/project-strategic-insight";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4.1-mini";

const MAX_CONTEXT_CHARS = 14_000;

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}\n[…truncado]`;
}

function buildContext(params: {
  projectName: string;
  projectDescription: string | null;
  meetings: Array<{
    title: string;
    meeting_date: string;
    raw_notes: string | null;
    insight: {
      parecer_geral: string | null;
      health_status: string | null;
      estrategista: unknown;
      advogado_diabo: unknown;
    } | null;
  }>;
}): string {
  const lines: string[] = [
    `PROJETO: ${params.projectName}`,
    params.projectDescription ? `DESCRIÇÃO: ${params.projectDescription}` : "",
    "",
    "REUNIÕES (mais recentes primeiro):",
  ].filter(Boolean) as string[];

  for (const m of params.meetings) {
    lines.push(`--- ${m.meeting_date} · ${m.title} ---`);
    if (m.raw_notes?.trim()) {
      lines.push(`NOTAS:\n${truncate(m.raw_notes.trim(), 4000)}`);
    }
    if (m.insight) {
      lines.push(`SAÚDE (insight): ${m.insight.health_status ?? "—"}`);
      if (m.insight.parecer_geral?.trim()) {
        lines.push(`PARECER GERAL:\n${truncate(m.insight.parecer_geral.trim(), 2000)}`);
      }
      const est = m.insight.estrategista as { executive_summary?: string } | null;
      if (est?.executive_summary?.trim()) {
        lines.push(`RESUMO EXECUTIVO:\n${truncate(est.executive_summary.trim(), 1500)}`);
      }
      const adv = m.insight.advogado_diabo as { risks?: Array<{ description?: string }> } | null;
      const riskTexts = adv?.risks?.map((r) => r.description).filter(Boolean) ?? [];
      if (riskTexts.length) {
        lines.push(`RISCOS (trechos): ${riskTexts.slice(0, 5).join(" | ")}`);
      }
    }
    lines.push("");
  }

  const joined = lines.join("\n");
  return truncate(joined, MAX_CONTEXT_CHARS);
}

function buildPrompt(context: string): string {
  return `Você é consultor sênior em projetos de inovação. Com base EXCLUSIVAMENTE nos dados abaixo sobre o projeto e suas reuniões, produza um insight estratégico único: visão do momento do projeto, tensões e próximos passos sugeridos.

DADOS:
${context}

Regras:
- Não invente fatos ausentes dos dados.
- Português do Brasil, tom profissional e direto.
- "tag" deve ser um rótulo curto (2–5 palavras) para o tema central (ex.: risco de escopo, alinhamento técnico).
- "actions" deve ter 2 a 3 itens concretos e curtos.

Retorne APENAS um JSON válido (sem markdown), neste formato exato:
{"body":"2 a 4 frases","tag":"rótulo curto","actions":["ação 1","ação 2"]}`;
}

export type RegenerateProjectStrategicInsightResult = { error: string | null };

/**
 * Recomputa e persiste o insight estratégico do projeto em `projects.ai_strategic_insight` (OpenRouter).
 * Chamadas automáticas podem ignorar o retorno; a UI usa `error` para feedback.
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

    const { data: meetingRows, error: mErr } = await supabase
      .from("meetings")
      .select(
        `
        title,
        meeting_date,
        raw_notes,
        meeting_insights (
          parecer_geral,
          health_status,
          estrategista,
          advogado_diabo
        )
      `
      )
      .eq("project_id", projectId)
      .order("meeting_date", { ascending: false });

    if (mErr) {
      return { error: mErr.message };
    }

    if (!meetingRows?.length) {
      return { error: "Não há reuniões neste projeto para gerar o insight." };
    }

    const meetings = meetingRows.map((row) => {
      const mi = row.meeting_insights as
        | {
            parecer_geral: string | null;
            health_status: string | null;
            estrategista: unknown;
            advogado_diabo: unknown;
          }
        | null
        | Array<{
            parecer_geral: string | null;
            health_status: string | null;
            estrategista: unknown;
            advogado_diabo: unknown;
          }>;
      const insight = Array.isArray(mi) ? mi[0] ?? null : mi;
      return {
        title: row.title,
        meeting_date: row.meeting_date,
        raw_notes: row.raw_notes,
        insight,
      };
    });

    const context = buildContext({
      projectName: project.name,
      projectDescription: project.description,
      meetings,
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

    return { error: null };
  } catch (e) {
    console.error("[project-strategic-insight]", e);
    return { error: e instanceof Error ? e.message : "Falha ao gerar insight." };
  }
}
