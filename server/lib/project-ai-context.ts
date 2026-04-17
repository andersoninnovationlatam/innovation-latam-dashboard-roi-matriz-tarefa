import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_CONTEXT_CHARS = 14_000;
const MAX_MEETINGS_FOR_AI = 10;

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}\n[…truncado]`;
}

function formatCompromissosAuditor(compromissos: unknown, auditorEntregas: unknown): string {
  const lines: string[] = [];

  const comp = compromissos as {
    commitments?: Array<{
      what: string;
      who: string;
      deadline: string | null;
      status: string;
    }>;
  } | null;
  if (comp?.commitments?.length) {
    lines.push("COMPROMISSOS:");
    for (const c of comp.commitments) {
      lines.push(
        `- ${c.what} | quem: ${c.who} | prazo: ${c.deadline ?? "—"} | status: ${c.status}`
      );
    }
  }

  const aud = auditorEntregas as {
    deliveries?: Array<{ item: string; status: string; evidence?: string }>;
  } | null;
  if (aud?.deliveries?.length) {
    lines.push("AUDITOR DE ENTREGAS:");
    for (const d of aud.deliveries) {
      const ev = d.evidence?.trim() ? ` | evidência: ${truncate(d.evidence.trim(), 200)}` : "";
      lines.push(`- ${d.item} | status: ${d.status}${ev}`);
    }
  }

  return lines.join("\n");
}

export type MeetingForAiContext = {
  title: string;
  meeting_date: string;
  raw_notes: string | null;
  insight: {
    parecer_geral: string | null;
    health_status: string | null;
    estrategista: unknown;
    advogado_diabo: unknown;
  } | null;
  compromissos: unknown;
  auditor_entregas: unknown;
};

/** Texto de contexto compartilhado (insight estratégico, velocidade, etc.). */
export function buildProjectAiContextString(params: {
  projectName: string;
  projectDescription: string | null;
  meetings: MeetingForAiContext[];
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
    const ca = formatCompromissosAuditor(m.compromissos, m.auditor_entregas);
    if (ca.trim()) {
      lines.push(ca);
    }
    lines.push("");
  }

  const joined = lines.join("\n");
  return truncate(joined, MAX_CONTEXT_CHARS);
}

export type LoadMeetingsForProjectAiResult =
  | { ok: false; error: string }
  | { ok: true; meetings: MeetingForAiContext[] };

export async function loadMeetingsForProjectAi(
  supabase: SupabaseClient,
  projectId: string
): Promise<LoadMeetingsForProjectAiResult> {
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
        advogado_diabo,
        compromissos,
        auditor_entregas
      )
    `
    )
    .eq("project_id", projectId)
    .order("meeting_date", { ascending: false })
    .limit(MAX_MEETINGS_FOR_AI);

  if (mErr) {
    return { ok: false, error: mErr.message };
  }

  const meetings = (meetingRows ?? []).map((row) => {
    const mi = row.meeting_insights as
      | {
          parecer_geral: string | null;
          health_status: string | null;
          estrategista: unknown;
          advogado_diabo: unknown;
          compromissos: unknown;
          auditor_entregas: unknown;
        }
      | null
      | Array<{
          parecer_geral: string | null;
          health_status: string | null;
          estrategista: unknown;
          advogado_diabo: unknown;
          compromissos: unknown;
          auditor_entregas: unknown;
        }>;
    const insightRow = Array.isArray(mi) ? mi[0] ?? null : mi;
    const insight = insightRow
      ? {
          parecer_geral: insightRow.parecer_geral,
          health_status: insightRow.health_status,
          estrategista: insightRow.estrategista,
          advogado_diabo: insightRow.advogado_diabo,
        }
      : null;
    return {
      title: row.title,
      meeting_date: row.meeting_date,
      raw_notes: row.raw_notes,
      insight,
      compromissos: insightRow?.compromissos ?? null,
      auditor_entregas: insightRow?.auditor_entregas ?? null,
    };
  });

  return { ok: true, meetings };
}
