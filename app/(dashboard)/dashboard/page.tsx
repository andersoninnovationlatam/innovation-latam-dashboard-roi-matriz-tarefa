import { getClientOverview } from "@/server/actions/clients";
import { getUserRole } from "@/server/auth/role";
import { ClientCard } from "@/components/features/dashboard/client-card";
import { MetricCard } from "@/components/features/dashboard/metric-card";
import { NewClientButton } from "@/components/features/dashboard/new-client-button";
import { Users, Rocket, AlertTriangle, Calendar } from "lucide-react";

export default async function DashboardPage() {
  const [clientsData, role] = await Promise.all([
    getClientOverview(),
    getUserRole(),
  ]);
  const isGestor = role === "gestor";

  // Calcular métricas agregadas
  const totalClients = clientsData.length;
  const criticalCount = clientsData.filter(
    (c) => c.latestHealth === "critical"
  ).length;
  const warningCount = clientsData.filter(
    (c) => c.latestHealth === "warning"
  ).length;
  const okCount = clientsData.filter((c) => c.latestHealth === "ok").length;
  
  const totalProjects = clientsData.reduce((sum, c) => sum + (c.activeProjects || 0), 0);
  const totalMeetings = clientsData.filter((c) => c.latestMeeting !== null).length;

  return (
    <div className="max-w-[1600px] mx-auto p-12 space-y-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">
            Main Dashboard
          </h2>
          <p className="text-on-surface-variant font-medium mt-1">
            Strategic oversight of your analytical projects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NewClientButton isGestor={isGestor} />
        </div>
      </header>

      {/* Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Active Clients"
          value={totalClients}
          badge="Active"
          icon={Users}
          iconBgColor="bg-primary-fixed"
          iconColor="text-primary"
          borderColor="border-primary/20"
          badgeColor="text-primary bg-primary/5"
        />
        <MetricCard
          label="Total Active Projects"
          value={totalProjects}
          badge="Active"
          icon={Rocket}
          iconBgColor="bg-secondary-container"
          iconColor="text-secondary"
          borderColor="border-secondary/20"
          badgeColor="text-secondary bg-secondary/5"
        />
        <MetricCard
          label="Critical Alerts"
          value={criticalCount}
          badge="Urgent"
          icon={AlertTriangle}
          iconBgColor="bg-error-container"
          iconColor="text-error"
          borderColor="border-error/20"
          badgeColor="text-error bg-error/5"
        />
        <MetricCard
          label="Total Meetings"
          value={totalMeetings}
          badge="Monthly"
          icon={Calendar}
          iconBgColor="bg-tertiary-fixed"
          iconColor="text-tertiary"
          borderColor="border-tertiary-container/20"
          badgeColor="text-tertiary bg-tertiary/5"
        />
      </section>

      {/* Client Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-headline text-on-surface">
            Portfolio Health
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-xs font-semibold text-on-surface-variant mr-4">
              Healthy
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-on-surface-variant mr-4">
              At Risk
            </span>
            <span className="w-2 h-2 rounded-full bg-error" />
            <span className="text-xs font-semibold text-on-surface-variant">
              Critical
            </span>
          </div>
        </div>
        {clientsData.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <p>Nenhum cliente encontrado.</p>
            <p className="text-sm mt-2">
              Clientes atribuídos a você aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {clientsData.map(
              ({
                client,
                latestHealth,
                latestMeeting,
                parecerExcerpt,
                activeProjects,
              }) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  latestHealth={latestHealth}
                  latestMeeting={latestMeeting}
                  parecerExcerpt={parecerExcerpt}
                  activeProjects={activeProjects}
                />
              )
            )}
            
          </div>
        )}
      </section>
    </div>
  );
}
