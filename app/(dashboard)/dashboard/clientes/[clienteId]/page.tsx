import { notFound } from "next/navigation";
import { getClientDetail } from "@/server/actions/clients";
import { HealthBadge } from "@/components/features/dashboard/health-badge";
import { NewProjectButton } from "@/components/features/dashboard/new-project-button";
import { AlertTriangle, Zap, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ClientDetailPageProps {
  params: Promise<{ clienteId: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { clienteId } = await params;
  
  let clientData;
  try {
    clientData = await getClientDetail(clienteId);
  } catch (error) {
    notFound();
  }

  const { client, projects, clientHealth, healthIndex, latestMeeting, latestParecer } = clientData;

  const healthColor = clientHealth === "critical" ? "bg-error" : clientHealth === "warning" ? "bg-amber-500" : "bg-secondary";

  return (
    <main className="max-w-[1600px] mx-auto p-12">
      {/* Client Hero Header */}
      <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
        <div className="md:col-span-2">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-surface-container-highest text-primary font-bold rounded-lg text-sm tracking-widest font-body">
              {client.code}
            </span>
            <HealthBadge status={clientHealth} />
          </div>
          <h1 className="text-5xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">
            {client.name}
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl font-body">
            Leading multimodal logistics operator. Primary focus on coastal shipping and terminal management across the Mercosur region.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs font-bold text-outline uppercase tracking-widest">
            Client Health Index
          </span>
          <div className="w-full bg-surface-container-high h-4 rounded-full overflow-hidden">
            <div
              className={`${healthColor} h-full rounded-full`}
              style={{ width: `${healthIndex}%` }}
            />
          </div>
          <span className={`text-3xl font-black font-headline ${clientHealth === "critical" ? "text-error" : clientHealth === "warning" ? "text-amber-500" : "text-secondary"}`}>
            {healthIndex}%
          </span>
        </div>
      </section>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Projects and Latest Insight */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Strategic Initiatives Table */}
          <div className="bg-surface-container-low rounded-xl p-8 border-none">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-on-surface">Strategic Initiatives</h2>
              <NewProjectButton clientId={clienteId} />
            </div>
            <div className="overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-on-surface-variant/60 text-[10px] uppercase tracking-[0.2em] font-bold">
                    <th className="pb-4">Project Identity</th>
                    <th className="pb-4">Health Status</th>
                    <th className="pb-4 text-right">Completion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="group hover:bg-surface-container transition-colors"
                    >
                      <td className="py-6">
                        <div className="flex flex-col">
                          <Link
                            href={`/dashboard/clientes/${clienteId}/projetos/${project.id}`}
                            className="text-on-surface font-semibold text-sm hover:text-primary transition-colors"
                          >
                            {project.name}
                          </Link>
                          <span className="text-xs text-on-surface-variant">
                            {project.description || "No description"}
                          </span>
                        </div>
                      </td>
                      <td className="py-6">
                        <HealthBadge status={project.healthStatus} />
                      </td>
                      <td className="py-6 text-right">
                        <span className="font-headline font-bold text-on-surface">
                          {project.completion}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Latest Insight Card */}
          {latestMeeting && (
            <div className="bg-surface-container-highest rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-32 h-32 text-on-surface-variant" />
              </div>
              <div className="flex items-center gap-2 mb-4 text-secondary font-bold text-xs uppercase tracking-widest">
                <Zap className="w-3 h-3" />
                Latest Insight
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">
                {latestMeeting.title}
              </h3>
              {latestParecer && (
                <div className="bg-white/50 dark:bg-surface-container-low/50 backdrop-blur-sm p-5 rounded-xl border-l-4 border-error mb-6">
                  <p className="text-on-surface-variant italic font-body text-sm leading-relaxed">
                    "{latestParecer}"
                  </p>
                </div>
              )}
              <Link
                href={`/dashboard/clientes/${clienteId}/projetos/${latestMeeting.project_id}/reunioes/${latestMeeting.id}`}
                className="inline-flex items-center gap-2 text-primary font-bold text-sm group"
              >
                Ver histórico completo de reuniões
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          {/* Engagement Overview */}
          <div className="bg-surface-container-low/80 backdrop-blur-md rounded-xl p-6 border border-outline-variant/10 shadow-sm">
            <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-6">
              Engagement Overview
            </h4>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Key Account Manager</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-on-surface">TBD</span>
                  <div className="w-6 h-6 rounded-full bg-surface-container-high" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Contract Value</span>
                <span className="text-sm font-semibold text-on-surface">TBD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Renewal Date</span>
                <span className="text-sm font-semibold text-error">TBD</span>
              </div>
            </div>
          </div>

          {/* Critical Blockers */}
          {clientHealth === "critical" && (
            <div className="bg-surface-container-high rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-error" />
                <h4 className="text-sm font-bold text-on-surface">Critical Blockers</h4>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/40 dark:bg-surface-container-low/40 rounded-lg border-none">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-error mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-on-surface">
                        Action Required
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-1">
                        Client health status is critical. Review latest meeting insights and take immediate action.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pulse Timeline */}
          <div className="pt-4">
            <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">
              Pulse Timeline
            </h4>
            <div className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/30">
              {latestMeeting && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-primary border-4 border-surface" />
                  <p className="text-[11px] text-outline font-bold">
                    {new Date(latestMeeting.meeting_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    }).toUpperCase()}
                  </p>
                  <p className="text-sm text-on-surface">
                    Latest meeting: <span className="font-semibold">{latestMeeting.title}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
