import { notFound } from "next/navigation";
import { getMeetingInsights } from "@/server/actions/meetings";
import { getUserRole } from "@/server/auth/role";
import {
  MeetingInsightUnavailable,
  MeetingInsightView,
} from "@/components/features/dashboard/meeting-insight-view";

interface MeetingInsightPageProps {
  params: Promise<{ clienteId: string; projetoId: string; reuniaoId: string }>;
}

export default async function MeetingInsightPage({ params }: MeetingInsightPageProps) {
  const { clienteId, projetoId, reuniaoId } = await params;

  const role = await getUserRole();
  const canDelete = role === "gestor" || role === "consultor";
  const canEdit = role === "gestor";

  let meetingData;
  try {
    meetingData = await getMeetingInsights(reuniaoId);
  } catch {
    notFound();
  }

  const { meeting, insights } = meetingData;
  const project = (meeting as { projects?: { name?: string; clients?: unknown } }).projects;

  if (!insights || !insights.health_status) {
    return <MeetingInsightUnavailable clienteId={clienteId} projetoId={projetoId} />;
  }

  const healthStatus = insights.health_status;
  const participants = insights.perfilador?.participants ?? [];
  const risks = insights.advogado_diabo?.risks ?? [];
  const deliveries = insights.auditor_entregas?.deliveries ?? [];
  const automationFramework = insights.arquiteto?.automation_framework ?? [];
  const techStack = insights.contexto_tecnico?.stack ?? [];
  const techInputs = insights.contexto_tecnico?.inputs ?? [];
  const mainPain = insights.contexto_tecnico?.main_pain ?? "N/A";
  const impactScore = insights.estrategista?.impact_score ?? "N/A";
  const executiveSummary = insights.estrategista?.executive_summary ?? null;
  const temperaturaLevel = insights.temperatura?.level ?? "low";
  const temperaturaSignals = insights.temperatura?.signals ?? [];
  const commitments = insights.compromissos?.commitments ?? [];
  const clientPending = insights.validacao_entregas?.client_pending ?? [];
  const parecerGeral = insights.parecer_geral ?? null;

  return (
    <MeetingInsightView
      clienteId={clienteId}
      projetoId={projetoId}
      reuniaoId={reuniaoId}
      canDelete={canDelete}
      canEdit={canEdit}
      meetingDate={meeting.meeting_date}
      rawNotes={(meeting as { raw_notes?: string | null }).raw_notes ?? null}
      projectName={project?.name ?? null}
      meetingTitle={meeting.title}
      healthStatus={healthStatus}
      participants={participants}
      risks={risks}
      deliveries={deliveries}
      automationFramework={automationFramework}
      techStack={techStack}
      techInputs={techInputs}
      mainPain={mainPain}
      impactScore={impactScore}
      executiveSummary={executiveSummary}
      temperaturaLevel={temperaturaLevel}
      temperaturaSignals={temperaturaSignals}
      commitments={commitments}
      clientPending={clientPending}
      parecerGeral={parecerGeral}
    />
  );
}
