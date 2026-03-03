import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="text-center space-y-2">
      <h1 className="text-4xl font-bold text-foreground">Olá mundo</h1>
      {user?.email && (
        <p className="text-muted-foreground">
          Logado como <span className="text-foreground font-medium">{user.email}</span>
        </p>
      )}
    </div>
  );
}
