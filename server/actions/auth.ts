"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const authErrorMessages: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "E-mail ainda não confirmado.",
  "User not found": "Usuário não encontrado.",
  "Too many requests": "Muitas tentativas. Tente novamente mais tarde.",
  "Email rate limit exceeded": "Muitas tentativas. Tente novamente mais tarde.",
  "Password should be at least 6 characters": "A senha deve ter no mínimo 6 caracteres.",
  "Signup requires a valid password": "Informe uma senha válida.",
  "User already registered": "Este e-mail já está cadastrado.",
};

function translateAuthError(message: string): string {
  return authErrorMessages[message] ?? message;
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translateAuthError(error.message) };
  return { error: null };
}

export async function signUp(
  email: string,
  password: string,
  fullName?: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/auth/callback`,
    },
  });
  if (error) return { error: translateAuthError(error.message), requiresConfirmation: false };
  // Se o usuário foi criado mas sem sessão ativa, significa que precisa confirmar e-mail
  const requiresConfirmation = !!data.user && !data.session;
  return { error: null, requiresConfirmation };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
