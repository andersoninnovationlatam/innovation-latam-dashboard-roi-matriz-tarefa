"use server";

import { createClient } from "@/lib/supabase/server";
import { assertGestor } from "@/server/auth/role";
import { meetingInsightsSchema } from "@/lib/schemas/meeting-insights";
import { regenerateProjectStrategicInsight } from "@/server/lib/project-strategic-insight";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4.1-mini";

function buildPrompt(rawNotes: string): string {
  return `Você é um sistema de análise de reuniões de consultoria. Analise as notas abaixo e retorne um JSON com exatamente a estrutura especificada.

NOTAS DA REUNIÃO:
${rawNotes}

Retorne um JSON com EXATAMENTE esta estrutura (sem campos extras, sem markdown):
{
  "perfilador": {
    "participants": [
      {
        "name": "string",
        "estimated_role": "string",
        "archetype": "executor" | "visionario" | "cetico" | "decisor_economico",
        "driver": "string",
        "ice_breakers": ["string"],
        "conflict_alert": "string (opcional)"
      }
    ]
  },
  "advogado_diabo": {
    "risks": [
      {
        "severity": "critical" | "warning" | "info",
        "type": "scope_creep" | "external_risk" | "smoke_signal" | "temperature",
        "description": "string",
        "impact": "string (opcional)",
        "recommendation": "string (opcional)"
      }
    ]
  },
  "auditor_entregas": {
    "deliveries": [
      {
        "item": "string",
        "status": "approved" | "approved_with_caveats" | "pending" | "blocked",
        "evidence": "string (opcional)"
      }
    ]
  },
  "arquiteto": {
    "automation_framework": [
      {
        "step": 1,
        "description": "string",
        "suggestion": "ia" | "hibrido" | "humano",
        "rationale": "string"
      }
    ],
    "tech_context": {
      "stack": ["string"],
      "inputs": ["string"],
      "outputs": ["string"]
    }
  },
  "estrategista": {
    "executive_summary": "string",
    "follow_up_email": {
      "subject": "string",
      "body": "string"
    },
    "impact_score": 7
  },
  "temperatura": {
    "level": "low" | "moderate" | "high",
    "signals": ["string"],
    "description": "string"
  },
  "compromissos": {
    "commitments": [
      {
        "what": "string",
        "who": "string",
        "deadline": "YYYY-MM-DD ou null",
        "status": "defined" | "to_confirm" | "delivered"
      }
    ]
  },
  "validacao_entregas": {
    "client_pending": [
      {
        "action": "string",
        "responsible": "string",
        "deadline": "YYYY-MM-DD ou null"
      }
    ]
  },
  "contexto_tecnico": {
    "stack": ["string"],
    "connectivity": "string",
    "inputs": ["string"],
    "expected_outputs": ["string"],
    "main_pain": "string"
  },
  "parecer_geral": "string com o parecer geral da reunião",
  "health_status": "ok" | "warning" | "critical"
}

Regras:
- impact_score deve ser um número entre 0 e 10
- Baseie todas as análises estritamente nas notas fornecidas
- Se algum dado não estiver presente nas notas, use arrays vazios ou strings descritivas
- health_status: "ok" se projeto saudável, "warning" se atenção necessária, "critical" se risco alto
- Retorne APENAS o JSON, sem texto adicional`;
}

export async function generateInsightsAction(meetingId: string) {
  const denied = await assertGestor();
  if (denied) return denied;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { error: "Chave da API OpenRouter não configurada." };
  }

  const supabase = await createClient();

  // Fetch the meeting raw_notes
  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("id, title, raw_notes, project_id")
    .eq("id", meetingId)
    .single();

  if (meetingError || !meeting) {
    return { error: "Reunião não encontrada." };
  }

  if (!meeting.raw_notes || meeting.raw_notes.trim().length === 0) {
    return { error: "Esta reunião não possui notas para analisar. Adicione notas antes de gerar insights." };
  }

  // Call OpenRouter
  let rawJson: string;
  try {
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
        messages: [{ role: "user", content: buildPrompt(meeting.raw_notes) }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { error: `Erro na API OpenRouter: ${response.status} — ${errText}` };
    }

    const json = await response.json();
    rawJson = json?.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    return { error: `Falha ao conectar com OpenRouter: ${String(err)}` };
  }

  // Parse and validate with Zod
  let parsed: ReturnType<typeof meetingInsightsSchema.safeParse>;
  try {
    const data = JSON.parse(rawJson);
    parsed = meetingInsightsSchema.safeParse(data);
  } catch {
    return { error: "Resposta da IA não é um JSON válido." };
  }

  if (!parsed.success) {
    return { error: `Resposta da IA em formato inesperado: ${parsed.error.errors[0]?.message}` };
  }

  const insights = parsed.data;

  // Upsert into meeting_insights
  const { error: upsertError } = await supabase
    .from("meeting_insights")
    .update({
      perfilador: insights.perfilador,
      advogado_diabo: insights.advogado_diabo,
      auditor_entregas: insights.auditor_entregas,
      arquiteto: insights.arquiteto,
      estrategista: insights.estrategista,
      temperatura: insights.temperatura,
      compromissos: insights.compromissos,
      validacao_entregas: insights.validacao_entregas,
      contexto_tecnico: insights.contexto_tecnico,
      parecer_geral: insights.parecer_geral,
      health_status: insights.health_status,
    })
    .eq("meeting_id", meetingId);

  if (upsertError) {
    return { error: upsertError.message };
  }

  try {
    await regenerateProjectStrategicInsight(meeting.project_id);
  } catch {
    /* insight de projeto é best-effort */
  }

  return { error: null };
}
