import { getClientOverview } from "@/server/actions/clients";
import { getUserRole } from "@/server/auth/role";
import { ClientCard } from "@/components/features/dashboard/client-card";
import { NewClientButton } from "@/components/features/dashboard/new-client-button";
import { Users } from "lucide-react";

export default async function ClientsListPage() {
  const [clientsData, role] = await Promise.all([
    getClientOverview(),
    getUserRole(),
  ]);
  const isGestor = role === "gestor";

  const totalClients = clientsData.length;
  const criticalCount = clientsData.filter((c) => c.latestHealth === "critical").length;
  const warningCount = clientsData.filter((c) => c.latestHealth === "warning").length;
  const okCount = clientsData.filter((c) => c.latestHealth === "ok").length;

  return (
    <div className="max-w-[1600px] mx-auto p-12 space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">
            Clients
          </h2>
          <p className="text-on-surface-variant font-medium mt-1">
            Manage and monitor all client engagements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NewClientButton isGestor={isGestor} />
        </div>
      </header>

      {/* Summary stats */}
      <section className="flex flex-wrap gap-6">
        <div className="flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-xl">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total</p>
            <p className="text-2xl font-headline font-extrabold text-on-surface">{totalClients}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-xl">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Healthy</p>
            <p className="text-2xl font-headline font-extrabold text-secondary">{okCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-xl">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">At Risk</p>
            <p className="text-2xl font-headline font-extrabold text-amber-500">{warningCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-xl">
          <div className="w-3 h-3 rounded-full bg-error" />
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Critical</p>
            <p className="text-2xl font-headline font-extrabold text-error">{criticalCount}</p>
          </div>
        </div>
      </section>

      {/* Client list */}
      <section className="space-y-6">
        {clientsData.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <p>Nenhum cliente encontrado.</p>
            <p className="text-sm mt-2">Clientes atribuídos a você aparecerão aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clientsData.map(({ client, latestHealth, latestMeeting, parecerExcerpt }) => (
              <ClientCard
                key={client.id}
                client={client}
                latestHealth={latestHealth}
                latestMeeting={latestMeeting}
                parecerExcerpt={parecerExcerpt}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
