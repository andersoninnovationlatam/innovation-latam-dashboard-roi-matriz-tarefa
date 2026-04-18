"use server";

import { createClient } from "@/lib/supabase/server";
import { assertGestor } from "@/server/auth/role";
import { meetingInsightsSchema } from "@/lib/schemas/meeting-insights";
import { regenerateProjectStrategicInsight } from "@/server/lib/project-strategic-insight";
import { callOpenRouter, parseOpenRouterJson } from "@/server/lib/openrouter";

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

const COOLDOWN_SECONDS = 30;

export async function generateInsightsAction(meetingId: string) {
  const denied = await assertGestor();
  if (denied) return denied;

  const supabase = await createClient();

  const { data: existingInsight } = await supabase
    .from("meeting_insights")
    .select("updated_at")
    .eq("meeting_id", meetingId)
    .maybeSingle();

  if (existingInsight?.updated_at) {
    const secondsSinceLast =
      (Date.now() - new Date(existingInsight.updated_at).getTime()) / 1000;
    if (secondsSinceLast < COOLDOWN_SECONDS) {
      return {
        error: `Aguarde ${Math.ceil(COOLDOWN_SECONDS - secondsSinceLast)}s antes de gerar novamente.`,
      };
    }
  }

  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("id, title, raw_notes, project_id")
    .eq("id", meetingId)
    .single();

  if (meetingError || !meeting) {
    return { error: "Reunião não encontrada." };
  }

  if (!meeting.raw_notes?.trim()) {
    return { error: "Esta reunião não possui notas para analisar. Adicione notas antes de gerar insights." };
  }

  const aiResult = await callOpenRouter({
    messages: [{ role: "user", content: buildPrompt(meeting.raw_notes) }],
    temperature: 0.3,
  });

  if (!aiResult.ok) return { error: aiResult.error };

  const jsonResult = parseOpenRouterJson<unknown>(aiResult.content);
  if (!jsonResult.ok) return { error: jsonResult.error };

  const parsed = meetingInsightsSchema.safeParse(jsonResult.data);
  if (!parsed.success) {
    return { error: `Resposta da IA em formato inesperado: ${parsed.error.errors[0]?.message}` };
  }

  const insights = parsed.data;

  const { error: upsertError } = await supabase
    .from("meeting_insights")
    .upsert(
      {
        meeting_id: meetingId,
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
      },
      { onConflict: "meeting_id" }
    );

  if (upsertError) {
    return { error: upsertError.message };
  }

  const projInsight = await regenerateProjectStrategicInsight(meeting.project_id);
  if (projInsight.error) {
    console.warn("[generateInsights] insight estratégico do projeto:", projInsight.error);
  }

  return { error: null };
}
