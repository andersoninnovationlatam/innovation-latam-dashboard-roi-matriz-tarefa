const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_MODEL = "openai/gpt-4.1-mini";

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    "https://innovationlatam.com"
  );
}

export type OpenRouterMessage = { role: "user" | "system" | "assistant"; content: string };

export type OpenRouterOptions = {
  messages: OpenRouterMessage[];
  temperature?: number;
};

export type OpenRouterResult =
  | { ok: true; content: string }
  | { ok: false; error: string };

export async function callOpenRouter(options: OpenRouterOptions): Promise<OpenRouterResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Chave da API OpenRouter não configurada." };
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": getSiteUrl(),
        "X-Title": "Innovation Latam Dashboard",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: options.messages,
        response_format: { type: "json_object" },
        temperature: options.temperature ?? 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { ok: false, error: `Erro na API OpenRouter: ${response.status} — ${errText}` };
    }

    const json = await response.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "";
    return { ok: true, content };
  } catch (err) {
    return { ok: false, error: `Falha ao conectar com OpenRouter: ${String(err)}` };
  }
}

export function parseOpenRouterJson<T>(
  content: string
): { ok: true; data: T } | { ok: false; error: string } {
  try {
    const data = JSON.parse(content) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Resposta da IA não é um JSON válido." };
  }
}
