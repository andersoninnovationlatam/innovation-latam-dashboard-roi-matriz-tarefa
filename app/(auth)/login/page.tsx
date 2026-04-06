"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Shield } from "lucide-react";
import { signIn } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setError(null);
    const result = await signIn(data.email, data.password);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="w-full max-w-[440px] relative">
      {/* Decoration */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
      
      {/* Card */}
      <div className="bg-surface-container-lowest/80 backdrop-blur-xl p-10 rounded-xl shadow-[0_20px_40px_-10px_rgba(34,25,31,0.06)] relative overflow-hidden">
        {/* Branding Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-6 shadow-lg shadow-primary/20">
            <Shield className="w-8 h-8 text-on-primary" />
          </div>
          <h1 className="font-headline font-extrabold text-2xl tracking-tight text-primary">
            Fábrica de Inovação
          </h1>
          <p className="font-body text-on-surface-variant text-sm mt-1">
            Innovation Latam Ecosystem
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <p className="text-sm text-error font-medium" role="alert">
              {error}
            </p>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="block font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1"
            >
              E-mail
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                className={cn(
                  "block w-full pl-11 pr-4 py-3.5 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-0 focus:bg-surface-container-lowest transition-all border-b-2 border-transparent focus:border-primary",
                  errors.email && "border-b-error"
                )}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-error text-[11px] font-medium ml-1 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <Label
                htmlFor="password"
                className="block font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
              >
                Senha
              </Label>
              <Link
                href="#"
                className="text-primary hover:text-primary-container text-[11px] font-semibold transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className={cn(
                  "block w-full pl-11 pr-4 py-3.5 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-0 focus:bg-surface-container-lowest transition-all border-b-2 border-transparent focus:border-primary",
                  errors.password && "border-b-error"
                )}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-error text-[11px] font-medium ml-1 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Action Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-primary-container text-on-primary-container font-headline font-bold text-sm rounded-xl hover:bg-primary transition-all duration-300 shadow-md shadow-primary/10 active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            {isSubmitting ? "Entrando…" : "Entrar"}
            <ArrowRight className="w-[18px] h-[18px] group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>

        {/* Secondary Actions */}
        <div className="mt-8 pt-8 text-center relative">
          {/* Divider */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[2px] bg-outline-variant/30" />
          <p className="font-body text-on-surface-variant text-sm">
            Ainda não faz parte?{" "}
            <Link
              href="/cadastro"
              className="text-primary font-bold hover:underline ml-1"
            >
              Criar conta
            </Link>
          </p>
        </div>

        {/* Footer Metadata */}
        <div className="mt-8 flex justify-center items-center gap-6 opacity-40">
          <div className="flex items-center gap-1.5 grayscale">
            <Shield className="w-[14px] h-[14px]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
              Segurança Atelier
            </span>
          </div>
          <div className="w-1 h-1 rounded-full bg-on-surface-variant" />
          <span className="text-[10px] font-medium">v2.4.0-analytical</span>
        </div>
      </div>
    </main>
  );
}
