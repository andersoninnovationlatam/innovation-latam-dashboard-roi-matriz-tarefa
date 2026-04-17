import { getClientOverview } from "@/server/actions/clients";
import { getUserRole } from "@/server/auth/role";
import { createClient } from "@/lib/supabase/server";
import { DashboardHomeView } from "@/components/features/dashboard/dashboard-home-view";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [clientsData, role, meetingsCount] = await Promise.all([
    getClientOverview(),
    getUserRole(),
    supabase.from("meetings").select("*", { count: "exact", head: true }),
  ]);
  const isGestor = role === "gestor";

  const totalClients = clientsData.length;
  const criticalCount = clientsData.filter(
    (c) => c.latestHealth === "critical"
  ).length;

  const totalProjects = clientsData.reduce((sum, c) => sum + (c.activeProjects || 0), 0);
  const totalMeetings = meetingsCount.count ?? 0;

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
