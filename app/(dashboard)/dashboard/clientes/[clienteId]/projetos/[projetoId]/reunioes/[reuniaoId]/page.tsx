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

  let meetingData;
  try {
    meetingData = await getMeetingInsights(reuniaoId);
  } catch {
    notFound();
  }

  const { meeting, insights } = meetingData;
  const project = (meeting as { projects?: { name?: string; clients?: unknown } }).projects;

  if (!insights) {
    return <MeetingInsightUnavailable clienteId={clienteId} projetoId={projetoId} />;
  }

  // Fallbacks conservadores: "warning" e "moderate" são mais seguros do que
  // assumir "ok"/"low" quando o campo não veio preenchido pela IA.
  const healthStatus = insights.health_status ?? "warning";
  const participants = insights.perfilador?.participants ?? [];
  const risks = insights.advogado_diabo?.risks ?? [];
  const deliveries = insights.auditor_entregas?.deliveries ?? [];
  const automationFramework = insights.arquiteto?.automation_framework ?? [];
  const techStack = insights.contexto_tecnico?.stack ?? [];
  const techInputs = insights.contexto_tecnico?.inputs ?? [];
  const mainPain = insights.contexto_tecnico?.main_pain ?? "N/A";
  const impactScore = insights.estrategista?.impact_score ?? "N/A";
  const executiveSummary = insights.estrategista?.executive_summary ?? null;
  const temperaturaLevel = insights.temperatura?.level ?? "moderate";
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
