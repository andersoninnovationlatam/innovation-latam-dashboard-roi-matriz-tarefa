import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SideNav } from "@/components/layout/side-nav";
import { TopAppBar } from "@/components/layout/top-app-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen">
      <SideNav userRole={profile?.role as "gestor" | "consultor" | "viewer"} />
      <TopAppBar userEmail={user.email || undefined} userName={profile?.full_name || undefined} />
      <main className="pl-64 pt-16 min-h-screen">{children}</main>
    </div>
  );
}
