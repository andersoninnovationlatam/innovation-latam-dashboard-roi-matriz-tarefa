"use server";

import { createClient } from "@/lib/supabase/server";
import { createClientSchema, type CreateClientInput } from "@/lib/schemas/meeting-insights";

export async function createClientAction(data: CreateClientInput) {
  const parsed = createClientSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("clients").insert({
    code: parsed.data.code,
    name: parsed.data.name,
    status: parsed.data.status,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
