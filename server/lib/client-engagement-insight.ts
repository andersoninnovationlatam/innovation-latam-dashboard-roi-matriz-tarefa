import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { callOpenRouter, parseOpenRouterJson } from "@/server/lib/openrouter";

const MAX_MEETINGS_FOR_ENGAGEMENT = 8;
const MAX_NOTES_CHARS = 3000;

function truncate(s: string, max: number): string {
  if (s.length <= max) return `${s.slice(0, max)}\n[…truncado]`;
  return s;
}

const engagementPayloadSchema = z.object({
  key_account: z.string().nullable(),
  contract_value: z.string().nullable(),
  end_date: z.string().nullable(),
});

export type ClientEngagementPayload = z.infer<typeof engagementPayloadSchema>;

export type InferClientEngagementResult =
  | { ok: true; data: ClientEngagementPayload }
  | { ok: false; error: string };

function buildPrompt(clientName: string, context: string): string {
  return `Você é um analista de relacionamento comercial. Com base EXCLUSIVAMENTE nas notas das reuniões abaixo do cliente "${clientName}", extraia as seguintes informações se mencionadas:

1. "key_account": nome do responsável principal pelo cliente (gerente de conta, consultor líder, CSM ou equivalente)
2. "contract_value": valor ou faixa do contrato/projeto (ex.: "R$ 120.000", "USD 50k", "~R$ 80k/mês") se mencionado
3. "end_date": data final do projeto, prazo de renovação ou término do contrato se mencionado (formato ISO 8601 ou descrição textual)

Se uma informação não for mencionada nas notas, retorne null para o campo correspondente. Não invente dados.

NOTAS DAS REUNIÕES:
${context}

Retorne APENAS um JSON válido (sem markdown):
{"key_account":null,"contract_value":null,"end_date":null}`;
}

export async function inferClientEngagement(
  clientId: string
): Promise<InferClientEngagementResult> {
  const supabase = await createClient();

  const { data: client, error: cErr } = await supabase
    .from("clients")
    .select("id, name")
    .eq("id", clientId)
    .single();

  if (cErr || !client) {
    return { ok: false, error: "Cliente não encontrado." };
  }

  const { data: meetings, error: mErr } = await supabase
    .from("meetings")
    .select("title, meeting_date, raw_notes, projects!inner(client_id)")
    .eq("projects.client_id", clientId)
    .order("meeting_date", { ascending: false })
    .limit(MAX_MEETINGS_FOR_ENGAGEMENT);

  if (mErr) {
    return { ok: false, error: `Erro ao carregar reuniões: ${mErr.message}` };
  }

  if (!meetings?.length) {
    return { ok: false, error: "Nenhuma reunião encontrada para este cliente." };
  }

  const contextLines: string[] = [];
  for (const m of meetings) {
    contextLines.push(`--- ${m.meeting_date} · ${m.title} ---`);
    if (m.raw_notes?.trim()) {
      contextLines.push(truncate(m.raw_notes.trim(), MAX_NOTES_CHARS));
    }
    contextLines.push("");
  }

  const aiResult = await callOpenRouter({
    messages: [{ role: "user", content: buildPrompt(client.name, contextLines.join("\n")) }],
    temperature: 0.2,
  });

  if (!aiResult.ok) {
    return { ok: false, error: aiResult.error };
  }

  const jsonResult = parseOpenRouterJson<unknown>(aiResult.content);
  if (!jsonResult.ok) return { ok: false, error: jsonResult.error };

  const parsed = engagementPayloadSchema.safeParse(jsonResult.data);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Resposta da IA em formato inesperado: ${parsed.error.errors[0]?.message ?? "inválido"}`,
    };
  }

  return { ok: true, data: parsed.data };
}
