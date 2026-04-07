import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/domain";

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return (profile?.role as UserRole) ?? null;
}

/** Retorno nulo = autorizado. Caso contrário, mensagem para exibir ao usuário. */
export async function assertGestor(): Promise<{ error: string } | null> {
  const role = await getUserRole();
  if (role !== "gestor") {
    return { error: "Apenas gestores podem realizar esta ação." };
  }
  return null;
}
