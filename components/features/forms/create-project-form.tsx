"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema, type CreateProjectInput } from "@/lib/schemas/meeting-insights";
import { createProjectAction } from "@/server/actions/projects";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, FolderKanban, ArrowRight } from "lucide-react";

interface CreateProjectFormProps {
  clientId: string;
  onClose: () => void;
}

export function CreateProjectForm({ clientId, onClose }: CreateProjectFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { client_id: clientId, status: "active" },
  });

  async function onSubmit(data: CreateProjectInput) {
    setServerError(null);
    const result = await createProjectAction(data);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-outline-variant/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-secondary-container text-secondary">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-headline font-bold text-on-surface">Novo Projeto</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <p className="text-sm text-error bg-error-container/20 px-4 py-2 rounded-lg" role="alert">
              {serverError}
            </p>
          )}

          <input type="hidden" {...register("client_id")} />

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Projeto</Label>
            <Input id="name" placeholder="Nome do projeto" {...register("name")} />
            {errors.name && (
              <p className="text-error text-[11px] font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              className="block w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              placeholder="Breve descrição do projeto"
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="block w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
              {...register("status")}
            >
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
              <option value="at_risk">Em Risco</option>
              <option value="completed">Concluído</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-surface-container-low text-on-surface-variant rounded-xl font-semibold text-sm hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? "Criando…" : "Criar Projeto"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
