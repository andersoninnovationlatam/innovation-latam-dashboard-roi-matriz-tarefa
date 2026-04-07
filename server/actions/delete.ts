"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/server/auth/role";

async function assertCanDelete(): Promise<{ error: string } | null> {
  const role = await getUserRole();
  if (role !== "gestor" && role !== "consultor") {
    return { error: "Apenas gestores e consultores podem realizar esta ação." };
  }
  return null;
}

export async function deleteProjectAction(projectId: string) {
  const denied = await assertCanDelete();
  if (denied) return denied;

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteMeetingAction(meetingId: string) {
  const denied = await assertCanDelete();
  if (denied) return denied;

  const supabase = await createClient();
  const { error } = await supabase
    .from("meetings")
    .delete()
    .eq("id", meetingId);

  if (error) return { error: error.message };
  return { error: null };
}
