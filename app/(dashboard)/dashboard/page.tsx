import { getClientOverview } from "@/server/actions/clients";
import { getUserRole } from "@/server/auth/role";
import { DashboardHomeView } from "@/components/features/dashboard/dashboard-home-view";

export default async function DashboardPage() {
  const [clientsData, role] = await Promise.all([
    getClientOverview(),
    getUserRole(),
  ]);
  const isGestor = role === "gestor";

  const totalClients = clientsData.length;
  const criticalCount = clientsData.filter(
    (c) => c.latestHealth === "critical"
  ).length;

  const totalProjects = clientsData.reduce((sum, c) => sum + (c.activeProjects || 0), 0);
  const totalMeetings = clientsData.filter((c) => c.latestMeeting !== null).length;

  return (
    <DashboardHomeView
      clientsData={clientsData}
      isGestor={isGestor}
      totalClients={totalClients}
      totalProjects={totalProjects}
      criticalCount={criticalCount}
      totalMeetings={totalMeetings}
    />
  );
}
