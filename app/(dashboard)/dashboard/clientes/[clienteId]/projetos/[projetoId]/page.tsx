import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectDetail, getProjectMeetings } from "@/server/actions/projects";
import { getUserRole } from "@/server/auth/role";
import { HealthBadge } from "@/components/features/dashboard/health-badge";
import { NewMeetingButton } from "@/components/features/dashboard/new-meeting-button";
import {
  ChevronRight,
  Sparkles,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  } catch (error) {
    notFound();
  }

  const { project, projectHealth, latestMeeting } = projectData;
  const client = (project as any).clients;

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "critical":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getHealthBg = (health: string) => {
    switch (health) {
      case "critical":
        return "bg-error/10 text-error";
      case "warning":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-500";
      default:
        return "bg-tertiary-fixed text-on-tertiary-fixed-variant";
    }
  };

  return (
    <main className="max-w-[1600px] mx-auto p-12">
      {/* Breadcrumb & Header */}
      <header className="mb-12">
        <div className="flex items-center gap-2 text-on-surface-variant font-label text-sm mb-4">
          <Link href="/dashboard/clientes" className="font-medium hover:text-primary">
            Clients
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href={`/dashboard/clientes/${clienteId}`}
            className="font-medium hover:text-primary"
          >
            {client?.name || "Client"}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary font-semibold">{project.name}</span>
        </div>
        <div className="flex justify-between items-end">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-3 font-headline">
              {project.name}
            </h1>
            <p className="text-on-surface-variant font-body leading-relaxed">
              {project.description || "No description available."}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">
                Overall Health
              </span>
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full font-bold",
                  projectHealth === "critical"
                    ? "bg-error-container text-on-error-container"
                    : projectHealth === "warning"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-500"
                    : "bg-secondary-container text-on-secondary-container"
                )}
              >
                {getHealthIcon(projectHealth)}
                {projectHealth === "critical"
                  ? "Critical Risk"
                  : projectHealth === "warning"
                  ? "At Risk"
                  : "Active"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          {/* KPI Row */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                Project Velocity
              </span>
              <div className="text-3xl font-headline font-extrabold text-primary">84%</div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[84%]" />
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                Resources Active
              </span>
              <div className="text-3xl font-headline font-extrabold text-secondary">12/15</div>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-surface-container-low bg-surface-container-high"
                  />
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-surface-container-low flex items-center justify-center bg-secondary text-[8px] text-on-secondary">
                  +9
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                Next Milestone
              </span>
              <div className="text-3xl font-headline font-extrabold text-tertiary">14d</div>
              <div className="text-xs text-on-surface-variant font-medium">Database Cutover</div>
            </div>
          </div>

          {/* AI Strategic Insight */}
          <section className="bg-white/50 dark:bg-surface-container-low/50 backdrop-blur-md rounded-xl p-8 shadow-sm border border-outline-variant/15">
            <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              AI Strategic Insight
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-body text-on-surface-variant mb-4">
                  The migration delta suggests a high friction point in the integration strategy.
                  Stakeholder sentiment has shifted since the initial interview.
                </p>
                <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold">
                  <TrendingUp className="w-3 h-3" />
                  Efficiency Optimizable
                </div>
              </div>
              <div className="bg-surface-container rounded-xl p-4">
                <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-3">
                  Priority Action Items
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-xs font-medium">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    Re-align architectural constraints with API team.
                  </li>
                  <li className="flex items-start gap-2 text-xs font-medium">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    Address security backlog from kickoff.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Meeting History */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-headline font-bold">Meeting History</h2>
              <NewMeetingButton projectId={projetoId} isGestor={isGestor} />
            </div>
            <div className="space-y-4">
              {meetings.map((meeting: any) => (
                <Link
                  key={meeting.id}
                  href={`/dashboard/clientes/${clienteId}/projetos/${projetoId}/reunioes/${meeting.id}`}
                  className="group bg-surface-container-lowest hover:bg-surface-container-low transition-all p-5 rounded-xl flex items-center justify-between cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-5">
                    <div className={cn("p-3 rounded-xl", getHealthBg(meeting.healthStatus))}>
                      {getHealthIcon(meeting.healthStatus)}
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">
                        {meeting.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-medium text-on-surface-variant">
                          {new Date(meeting.meeting_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant" />
                        <span
                          className={cn(
                            "text-xs font-bold uppercase tracking-tighter",
                            meeting.healthStatus === "critical"
                              ? "text-error"
                              : meeting.healthStatus === "warning"
                              ? "text-amber-700 dark:text-amber-500"
                              : "text-tertiary"
                          )}
                        >
                          Status: {meeting.healthStatus === "critical" ? "Critical" : meeting.healthStatus === "warning" ? "Warning" : "OK"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          {/* Project Identity */}
          <div className="bg-surface-container p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BarChart3 className="w-32 h-32 text-on-surface-variant" />
            </div>
            <div className="relative z-10">
              <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                Active Sprint
              </span>
              <div className="mt-4">
                <div className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">
                  Lead Client
                </div>
                <div className="text-xl font-headline font-bold text-primary">
                  {client?.name || "N/A"}
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-on-surface-variant">Architecture Readiness</span>
                  <span>65%</span>
                </div>
                <div className="h-1 bg-surface-container-highest rounded-full">
                  <div className="h-full bg-secondary w-[65%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Actions */}
          <div className="bg-surface-container-high p-8 rounded-xl">
            <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">
              Upcoming Actions
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-error" />
                  <div className="w-px h-10 bg-outline-variant mt-2" />
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">API Gateway Freeze</div>
                  <div className="text-[10px] text-on-surface-variant mt-1">Due in 2 days</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-outline" />
                  <div className="w-px h-10 bg-outline-variant mt-2" />
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">Compliance Review</div>
                  <div className="text-[10px] text-on-surface-variant mt-1">Due in 5 days</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-outline" />
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">Cloud Provider Audit</div>
                  <div className="text-[10px] text-on-surface-variant mt-1">Due in 8 days</div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-8 py-2 text-xs font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
            >
              Expand Roadmap
            </Button>
          </div>

          {/* Resource Efficiency */}
          <div className="bg-tertiary-container/10 p-8 rounded-xl border border-tertiary-container/10">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-tertiary" />
              <h2 className="text-sm font-bold text-tertiary">Resource Burn Rate</h2>
            </div>
            <div className="text-2xl font-headline font-bold text-on-background mb-1">
              Optimized
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Infrastructure costs are currently 12% under budget due to efficient staging
              utilization.
            </p>
          </div>
        </div>
      </div>

      {isGestor && (
        <div className="fixed bottom-8 right-8 flex flex-col gap-4">
          <Button
            size="icon"
            className="w-14 h-14 bg-primary-container text-on-primary-container rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <Edit className="w-6 h-6" />
          </Button>
        </div>
      )}
    </main>
  );
}
