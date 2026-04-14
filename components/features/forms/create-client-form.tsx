"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientSchema, type CreateClientInput } from "@/lib/schemas/meeting-insights";
import { createClientAction } from "@/server/actions/clients";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Building2, ArrowRight } from "lucide-react";

interface CreateClientFormProps {
  onClose: () => void;
}

export function CreateClientForm({ onClose }: CreateClientFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: { status: "active" },
  });

  async function onSubmit(data: CreateClientInput) {
    setServerError(null);
    const result = await createClientAction(data);
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
          <div className="p-2 rounded-xl bg-primary-fixed text-primary">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-headline font-bold text-on-surface">Novo Cliente</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <p className="text-sm text-error bg-error-container/20 px-4 py-2 rounded-lg" role="alert">
              {serverError}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Código</Label>
            <Input id="code" placeholder="Ex: CLI001" {...register("code")} />
            {errors.code && (
              <p className="text-error text-[11px] font-medium">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Nome do cliente" {...register("name")} />
            {errors.name && (
              <p className="text-error text-[11px] font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="block w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
              {...register("status")}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="negotiation">Em Negociação</option>
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
              {isSubmitting ? "Criando…" : "Criar Cliente"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
