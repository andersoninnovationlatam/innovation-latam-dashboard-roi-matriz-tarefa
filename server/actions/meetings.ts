"use server";

import { createClient } from "@/lib/supabase/server";
import { assertGestor } from "@/server/auth/role";
import {
  createMeetingSchema,
  type CreateMeetingInput,
  updateMeetingSchema,
  type UpdateMeetingInput,
} from "@/lib/schemas/meeting-insights";
import type { MeetingInsights } from "@/lib/types/domain";

export async function createMeetingAction(data: CreateMeetingInput) {
  const denied = await assertGestor();
  if (denied) return denied;

  const parsed = createMeetingSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { data: meeting, error } = await supabase
    .from("meetings")
    .insert({
      project_id: parsed.data.project_id,
      title: parsed.data.title,
      meeting_date: parsed.data.meeting_date,
      raw_notes: parsed.data.raw_notes ?? null,
    })
    .select("id")
    .single();

  if (error || !meeting) {
    return { error: error?.message ?? "Não foi possível criar a reunião." };
  }

  return { error: null };
}

export async function updateMeetingAction(data: UpdateMeetingInput) {
  const denied = await assertGestor();
  if (denied) return denied;

  const parsed = updateMeetingSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("meetings")
    .update({
      title: parsed.data.title,
      meeting_date: parsed.data.meeting_date,
      raw_notes: parsed.data.raw_notes ?? null,
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function getMeetingInsights(meetingId: string) {
  const supabase = await createClient();
  const { data: meeting, error } = await supabase
    .from("meetings")
    .select(
      `
      *,
      projects (
        *,
        clients (
          id,
          code,
          name,
          status,
          created_at
        )
      )
    `
    )
    .eq("id", meetingId)
    .single();

  if (error || !meeting) {
    throw new Error("Reunião não encontrada.");
  }

  const { data: insights } = await supabase
    .from("meeting_insights")
    .select("*")
    .eq("meeting_id", meetingId)
    .maybeSingle();

  return {
    meeting,
    insights: insights as MeetingInsights | null,
  };
}
