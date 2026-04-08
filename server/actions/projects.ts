"use server";

import { createClient } from "@/lib/supabase/server";
import { assertGestor } from "@/server/auth/role";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/lib/schemas/meeting-insights";
import type { HealthStatus, Meeting } from "@/lib/types/domain";
import { projectVelocityPayloadSchema, type ProjectVelocityPayload } from "@/lib/schemas/project-velocity";
import { regenerateProjectVelocity } from "@/server/lib/project-velocity";

export async function createProjectAction(data: CreateProjectInput) {
  const denied = await assertGestor();
  if (denied) return denied;

  const parsed = createProjectSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("projects").insert({
    client_id: parsed.data.client_id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    status: parsed.data.status,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function getProjectDetail(projectId: string) {
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      clients (
        id,
        code,
        name,
        status,
        created_at
      )
    `
    )
    .eq("id", projectId)
    .single();

  if (error || !project) {
    throw new Error("Projeto não encontrado.");
  }

  const { data: pch } = await supabase
    .from("project_current_health")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  const projectHealth = (pch?.health_status ?? "ok") as HealthStatus;

  let latestMeeting: Meeting | null = null;
  if (pch?.latest_meeting_id && pch.latest_meeting_date) {
    latestMeeting = {
      id: pch.latest_meeting_id,
      project_id: projectId,
      meeting_date: pch.latest_meeting_date,
      title: pch.latest_meeting_title ?? "",
      created_at: pch.latest_meeting_date,
    };
  }

  const velocityParsed = projectVelocityPayloadSchema.safeParse(
    (project as { ai_velocity?: unknown }).ai_velocity
  );
  let projectVelocity: ProjectVelocityPayload | null = velocityParsed.success ? velocityParsed.data : null;

  if (!projectVelocity) {
    const { count } = await supabase
      .from("meetings")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);
    if (count && count > 0) {
      const vel = await regenerateProjectVelocity(projectId);
      projectVelocity = vel.payload;
    }
  }

  return { project, projectHealth, latestMeeting, projectVelocity };
}

type MeetingRow = {
  id: string;
  meeting_date: string;
  title: string;
  project_id: string;
  created_at: string;
  healthStatus: HealthStatus;
};

export async function getProjectMeetings(projectId: string): Promise<MeetingRow[]> {
  const supabase = await createClient();
  const { data: meetings } = await supabase
    .from("meetings")
    .select("id, meeting_date, title, project_id, created_at")
    .eq("project_id", projectId)
    .order("meeting_date", { ascending: false });

  const ids = meetings?.map((m) => m.id) ?? [];
  if (ids.length === 0) return [];

  const { data: insights } = await supabase
    .from("meeting_insights")
    .select("meeting_id, health_status")
    .in("meeting_id", ids);

  const healthByMeeting = new Map(
    insights?.map((i) => [i.meeting_id, i.health_status as HealthStatus]) ?? []
  );

  return (meetings ?? []).map((m) => ({
    ...m,
    healthStatus: healthByMeeting.get(m.id) ?? "ok",
  }));
}
