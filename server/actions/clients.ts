"use server";

import { createClient } from "@/lib/supabase/server";
import { assertGestor } from "@/server/auth/role";
import { createClientSchema, type CreateClientInput } from "@/lib/schemas/meeting-insights";
import type {
  Client,
  ClientCurrentHealth,
  HealthStatus,
  Meeting,
  ProjectCurrentHealth,
} from "@/lib/types/domain";

export type ClientOverviewItem = {
  client: Client;
  latestHealth: HealthStatus;
  latestMeeting: Meeting | null;
  parecerExcerpt: string;
  activeProjects: number;
};

function pickLatestProjectForClient(
  rows: ProjectCurrentHealth[],
  clientId: string
): ProjectCurrentHealth | null {
  let best: ProjectCurrentHealth | null = null;
  for (const r of rows) {
    if (r.client_id !== clientId || !r.latest_meeting_date) continue;
    if (
      !best ||
      (best.latest_meeting_date &&
        r.latest_meeting_date > best.latest_meeting_date)
    ) {
      best = r;
    }
  }
  return best;
}

export async function getClientOverview(): Promise<ClientOverviewItem[]> {
  const supabase = await createClient();

  const { data: healthRows, error: hErr } = await supabase
    .from("client_current_health")
    .select("*")
    .order("name", { ascending: true });

  if (hErr || !healthRows?.length) {
    const { data: fallback } = await supabase
      .from("clients")
      .select("id, code, name, status, created_at")
      .order("name", { ascending: true });

    return (fallback ?? []).map((c) => ({
      client: {
        id: c.id,
        code: c.code,
        name: c.name,
        status: c.status,
        created_at: c.created_at,
      },
      latestHealth: "ok" as HealthStatus,
      latestMeeting: null,
      parecerExcerpt: "",
      activeProjects: 0,
    }));
  }

  const typed = healthRows as ClientCurrentHealth[];
  const clientIds = typed.map((r) => r.client_id);

  const { data: clientMeta } = await supabase
    .from("clients")
    .select("id, created_at")
    .in("id", clientIds);

  const createdMap = new Map(
    clientMeta?.map((c) => [c.id, c.created_at as string]) ?? []
  );

  const { data: pchRows } = await supabase
    .from("project_current_health")
    .select("*")
    .in("client_id", clientIds);

  const pchList = (pchRows ?? []) as ProjectCurrentHealth[];

  return typed.map((row) => {
    const client: Client = {
      id: row.client_id,
      code: row.code,
      name: row.name,
      status: row.client_status,
      created_at: createdMap.get(row.client_id) ?? new Date().toISOString(),
    };

    const best = pickLatestProjectForClient(pchList, row.client_id);
    let latestMeeting: Meeting | null = null;
    let parecerExcerpt = "";
    if (best?.latest_meeting_id && best.latest_meeting_date) {
      latestMeeting = {
        id: best.latest_meeting_id,
        project_id: best.project_id,
        meeting_date: best.latest_meeting_date,
        title: best.latest_meeting_title ?? "",
        created_at: best.latest_meeting_date,
      };
      parecerExcerpt = (best.parecer_geral ?? "").trim();
    }

    return {
      client,
      latestHealth: row.health_status,
      latestMeeting,
      parecerExcerpt,
      activeProjects: Number(row.active_projects ?? 0),
    };
  });
}

export type ClientDetailData = {
  client: Client;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    healthStatus: HealthStatus;
    completion: number;
  }>;
  clientHealth: HealthStatus;
  healthIndex: number;
  latestMeeting: Meeting | null;
  latestParecer: string | null;
};

export async function getClientDetail(clientId: string): Promise<ClientDetailData> {
  const supabase = await createClient();

  const { data: client, error: cErr } = await supabase
    .from("clients")
    .select("id, code, name, status, created_at")
    .eq("id", clientId)
    .single();

  if (cErr || !client) {
    throw new Error("Cliente não encontrado.");
  }

  const { data: cch } = await supabase
    .from("client_current_health")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, description, status")
    .eq("client_id", clientId);

  const { data: pchAll } = await supabase
    .from("project_current_health")
    .select("*")
    .eq("client_id", clientId);

  const pchList = (pchAll ?? []) as ProjectCurrentHealth[];

  const projectsWithHealth = (projects ?? []).map((p) => {
    const pch = pchList.find((x) => x.project_id === p.id);
    const healthStatus = (pch?.health_status ?? "ok") as HealthStatus;
    const completion =
      healthStatus === "ok" ? 92 : healthStatus === "warning" ? 68 : 40;
    return {
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      healthStatus,
      completion,
    };
  });

  const clientHealth = (cch?.health_status ??
    ("ok" as HealthStatus)) as HealthStatus;
  const healthIndex =
    clientHealth === "critical" ? 35 : clientHealth === "warning" ? 62 : 88;

  const best = pickLatestProjectForClient(pchList, clientId);
  let latestMeeting: Meeting | null = null;
  let latestParecer: string | null = null;
  if (best?.latest_meeting_id && best.latest_meeting_date) {
    latestMeeting = {
      id: best.latest_meeting_id,
      project_id: best.project_id,
      meeting_date: best.latest_meeting_date,
      title: best.latest_meeting_title ?? "",
      created_at: best.latest_meeting_date,
    };
    latestParecer = best.parecer_geral;
  }

  return {
    client: {
      id: client.id,
      code: client.code,
      name: client.name,
      status: client.status,
      created_at: client.created_at,
    },
    projects: projectsWithHealth,
    clientHealth,
    healthIndex,
    latestMeeting,
    latestParecer,
  };
}

export async function createClientAction(data: CreateClientInput) {
  const denied = await assertGestor();
  if (denied) return denied;

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
