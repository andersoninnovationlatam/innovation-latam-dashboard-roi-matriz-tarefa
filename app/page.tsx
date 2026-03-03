import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold text-foreground">Fullstack Starter</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Boilerplate com Next.js, Supabase Auth e deploy no Cloudflare Workers.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Entrar</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/cadastro">Criar conta</Link>
        </Button>
      </div>
    </main>
  );
}
