import { notFound } from "next/navigation";
import { getProjectDetail, getProjectMeetings } from "@/server/actions/projects";
import { getUserRole } from "@/server/auth/role";
import { ProjectDetailView } from "@/components/features/dashboard/project-detail-view";
import { projectStrategicInsightPayloadSchema } from "@/lib/schemas/project-strategic-insight";

interface ProjectDetailPageProps {
  params: Promise<{ clienteId: string; projetoId: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { clienteId, projetoId } = await params;

  const role = await getUserRole();
  const isGestor = role === "gestor";

  let projectData;
  let meetings;
  try {
    projectData = await getProjectDetail(projetoId);
    meetings = await getProjectMeetings(projetoId);
  } catch {
    notFound();
  }

  const { project, projectHealth } = projectData;
  const client = (project as { clients?: { name?: string } | null }).clients;

  const rawInsight = (project as { ai_strategic_insight?: unknown }).ai_strategic_insight;
  const parsedInsight = projectStrategicInsightPayloadSchema.safeParse(rawInsight);
  const strategicInsight = parsedInsight.success ? parsedInsight.data : null;

  return (
    <ProjectDetailView
      clienteId={clienteId}
      projetoId={projetoId}
      projectName={project.name}
      projectDescription={project.description}
      projectHealth={projectHealth}
      strategicInsight={strategicInsight}
      clientName={client?.name ?? null}
      meetings={meetings.map((m: { id: string; title: string; meeting_date: string; healthStatus: string }) => ({
        id: m.id,
        title: m.title,
        meeting_date: m.meeting_date,
        healthStatus: m.healthStatus,
      }))}
      isGestor={isGestor}
    />
  );
}
