"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUp } from "@/server/actions/auth";
import { Mail, Lock, ArrowRight, UserPlus, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type SignUpForm = z.infer<typeof signUpSchema>;

export default function CadastroPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(data: SignUpForm) {
    setError(null);
    const result = await signUp(data.email, data.password, data.fullName);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="w-full max-w-[440px] relative">
      <div className="fixed top-8 right-8 z-50">
        <ThemeToggle />
      </div>
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />

      <div className="bg-surface-container-lowest/80 backdrop-blur-xl p-10 rounded-xl shadow-[0_20px_40px_-10px_rgba(34,25,31,0.06)] relative overflow-hidden">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-6 shadow-lg shadow-primary/20">
            <UserPlus className="text-on-primary w-7 h-7" />
          </div>
          <h1 className="font-headline font-extrabold text-2xl tracking-tight text-primary">
            Criar Conta
          </h1>
          <p className="font-body text-on-surface-variant text-sm mt-1">
            Innovation Latam Ecosystem
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <p className="text-sm text-error text-center" role="alert">
              {error}
            </p>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <label
              className="block font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1"
              htmlFor="fullName"
            >
              Nome completo
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                <User className="h-5 w-5" />
              </div>
              <input
                className="block w-full pl-11 pr-4 py-3.5 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-0 focus:bg-surface-container-lowest transition-all border-b-2 border-transparent focus:border-primary"
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                autoComplete="name"
                {...register("fullName")}
              />
            </div>
            {errors.fullName && (
              <p className="text-error text-[11px] font-medium ml-1 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              className="block font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1"
              htmlFor="email"
            >
              E-mail
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <input
                className="block w-full pl-11 pr-4 py-3.5 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-0 focus:bg-surface-container-lowest transition-all border-b-2 border-transparent focus:border-primary"
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-error text-[11px] font-medium ml-1 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              className="block font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1"
              htmlFor="password"
            >
              Senha
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input
                className="block w-full pl-11 pr-4 py-3.5 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-0 focus:bg-surface-container-lowest transition-all border-b-2 border-transparent focus:border-primary"
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-error text-[11px] font-medium ml-1 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label
              className="block font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1"
              htmlFor="confirmPassword"
            >
              Confirmar senha
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input
                className="block w-full pl-11 pr-4 py-3.5 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-0 focus:bg-surface-container-lowest transition-all border-b-2 border-transparent focus:border-primary"
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-error text-[11px] font-medium ml-1 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            className="w-full py-4 bg-primary-container text-on-primary-container font-headline font-bold text-sm rounded-xl hover:bg-primary transition-all duration-300 shadow-md shadow-primary/10 active:scale-[0.98] flex items-center justify-center gap-2 group"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Criando conta…" : "Criar conta"}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-8 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[2px] bg-outline-variant/30" />
          <p className="font-body text-on-surface-variant text-sm">
            Já tem conta?
            <Link className="text-primary font-bold hover:underline ml-1" href="/login">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
