import { createClient } from "@/lib/supabase/server";
import { callOpenRouter } from "@/server/lib/openrouter";

function buildPrompt(clientName: string): string {
  return `Você é um copywriter B2B especializado em inovação corporativa. Escreva uma descrição profissional e concisa (2 a 3 frases) para o cliente abaixo, que é parceiro de uma consultoria de inovação.

Cliente: "${clientName}"

Regras:
- Tom profissional, direto e positivo
- Destaque o potencial de inovação da empresa
- Português do Brasil
- Sem especulações — use linguagem que se aplique a qualquer empresa do segmento inferido pelo nome
- Retorne APENAS o texto da descrição, sem aspas ou markdown`;
}

export async function generateClientDescription(
  clientId: string,
  clientName: string
): Promise<void> {
  const supabase = await createClient();

  const aiResult = await callOpenRouter({
    messages: [{ role: "user", content: buildPrompt(clientName) }],
    temperature: 0.5,
  });

  if (!aiResult.ok) {
    console.warn("[client-description] OpenRouter:", aiResult.error);
    return;
  }

  const description = aiResult.content.trim();
  if (!description) return;

  const { error } = await supabase
    .from("clients")
    .update({ description })
    .eq("id", clientId);

  if (error) {
    console.warn("[client-description] Falha ao salvar descrição:", error.message);
  }
}
