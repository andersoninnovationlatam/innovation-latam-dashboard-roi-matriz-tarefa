import { getClientOverview } from "@/server/actions/clients";
import { getUserRole } from "@/server/auth/role";
import { ClientsListView } from "@/components/features/dashboard/clients-list-view";

export default async function ClientsListPage() {
  const [clientsData, role] = await Promise.all([getClientOverview(), getUserRole()]);
  const isGestor = role === "gestor";

  const totalClients = clientsData.length;
  const criticalCount = clientsData.filter((c) => c.latestHealth === "critical").length;
  const warningCount = clientsData.filter((c) => c.latestHealth === "warning").length;
  const okCount = clientsData.filter((c) => c.latestHealth === "ok").length;

  return (
    <ClientsListView
      clientsData={clientsData}
      isGestor={isGestor}
      totalClients={totalClients}
      criticalCount={criticalCount}
      warningCount={warningCount}
      okCount={okCount}
    />
  );
}
