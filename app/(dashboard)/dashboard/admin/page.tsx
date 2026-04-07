import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Shield, Users, UserPlus, Settings } from "lucide-react";
import { InviteUserForm } from "@/components/features/admin/invite-user-form";
import { EditUserRole } from "@/components/features/admin/edit-user-role";
import { RemoveUserButton } from "@/components/features/admin/remove-user-button";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check user is gestor
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "gestor") {
    redirect("/dashboard");
  }

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false });

  const allProfiles = profiles ?? [];

  return (
    <div className="max-w-[1600px] mx-auto p-12 space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">
            Admin Panel
          </h2>
          <p className="text-on-surface-variant font-medium mt-1">
            Gerenciamento de usuários e administração do sistema.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-xl text-on-surface-variant text-sm font-medium">
            <Shield className="w-4 h-4 text-primary" />
            Gestor Access
          </div>
          <InviteUserForm />
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-container-low p-6 rounded-xl border-b-4 border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary-fixed text-primary">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Total de Usuários</p>
          <h3 className="text-4xl font-extrabold font-headline text-on-surface">{allProfiles.length}</h3>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl border-b-4 border-secondary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-secondary-container text-secondary">
              <Shield className="h-5 w-5" />
            </div>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Gestores</p>
          <h3 className="text-4xl font-extrabold font-headline text-on-surface">
            {allProfiles.filter((p) => p.role === "gestor").length}
          </h3>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl border-b-4 border-tertiary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-tertiary-fixed text-tertiary">
              <UserPlus className="h-5 w-5" />
            </div>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Consultores</p>
          <h3 className="text-4xl font-extrabold font-headline text-on-surface">
            {allProfiles.filter((p) => p.role === "consultor").length}
          </h3>
        </div>
      </section>

      {/* Users Table */}
      <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold font-headline text-on-surface flex items-center gap-2">
            <Settings className="w-5 h-5 text-on-surface-variant" />
            Diretório de Usuários
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-on-surface-variant/60 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="pb-4 px-2">Nome</th>
                <th className="pb-4 px-2">Papel</th>
                <th className="pb-4 px-2">Membro desde</th>
                <th className="pb-4 px-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {allProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm">
                        {p.full_name
                          ? p.full_name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : "U"}
                      </div>
                      <span className="font-semibold text-on-surface text-sm">
                        {p.full_name || "Unnamed User"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                        p.role === "gestor"
                          ? "bg-primary/10 text-primary"
                          : p.role === "consultor"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {p.role}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-sm text-on-surface-variant">
                    {new Date(p.created_at).toLocaleDateString("pt-BR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center justify-end gap-1">
                      <EditUserRole
                        userId={p.id}
                        currentRole={p.role as "gestor" | "consultor" | "viewer"}
                        currentUserId={user.id}
                      />
                      <RemoveUserButton
                        userId={p.id}
                        userName={p.full_name || "Unnamed User"}
                        currentUserId={user.id}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
