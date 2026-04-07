import { notFound } from "next/navigation";
import { getClientDetail } from "@/server/actions/clients";
import { getUserRole } from "@/server/auth/role";
import { ClientDetailView } from "@/components/features/dashboard/client-detail-view";

interface ClientDetailPageProps {
  params: Promise<{ clienteId: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { clienteId } = await params;

  const role = await getUserRole();
  const isGestor = role === "gestor";

  let clientData;
  try {
    clientData = await getClientDetail(clienteId);
  } catch {
    notFound();
  }

  const { client, projects, clientHealth, healthIndex, latestMeeting, latestParecer } = clientData;

  return (
    <ClientDetailView
      clienteId={clienteId}
      clientCode={client.code}
      clientName={client.name}
      clientHealth={clientHealth}
      healthIndex={healthIndex}
      projects={projects}
      latestMeeting={latestMeeting}
      latestParecer={latestParecer}
      isGestor={isGestor}
    />
  );
}
