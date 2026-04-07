"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertGestor } from "@/server/auth/role";
import type { UserRole } from "@/lib/types/domain";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("E-mail inválido"),
  role: z.enum(["gestor", "consultor", "viewer"]).default("viewer"),
  full_name: z.string().optional(),
});

export async function inviteUserAction(data: {
  email: string;
  role: UserRole;
  full_name?: string;
}) {
  const denied = await assertGestor();
  if (denied) return denied;

  const parsed = inviteSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Dados inválidos." };
  }

  const adminClient = createAdminClient();

  const { data: invited, error } = await adminClient.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: {
        full_name: parsed.data.full_name ?? "",
        role: parsed.data.role,
      },
    }
  );

  if (error) return { error: error.message };

  // Update the profile's role after invite creates the user
  if (invited?.user?.id) {
    await adminClient
      .from("profiles")
      .update({ role: parsed.data.role, full_name: parsed.data.full_name ?? null })
      .eq("id", invited.user.id);
  }

  return { error: null };
}

export async function updateUserRoleAction(userId: string, role: UserRole) {
  const denied = await assertGestor();
  if (denied) return denied;

  if (!["gestor", "consultor", "viewer"].includes(role)) {
    return { error: "Papel inválido." };
  }

  // Prevent gestor from changing their own role
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === userId) {
    return { error: "Você não pode alterar seu próprio papel." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function removeUserAction(userId: string) {
  const denied = await assertGestor();
  if (denied) return denied;

  // Prevent gestor from removing themselves
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === userId) {
    return { error: "Você não pode remover sua própria conta." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) return { error: error.message };
  return { error: null };
}
