"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMeetingSchema, type CreateMeetingInput } from "@/lib/schemas/meeting-insights";
import { createMeetingAction } from "@/server/actions/meetings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Calendar, ArrowRight } from "lucide-react";

interface CreateMeetingFormProps {
  projectId: string;
  onClose: () => void;
}

export function CreateMeetingForm({ projectId, onClose }: CreateMeetingFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateMeetingInput>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      project_id: projectId,
      meeting_date: new Date().toISOString().split("T")[0],
    },
  });

  async function onSubmit(data: CreateMeetingInput) {
    setServerError(null);
    const result = await createMeetingAction(data);
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
          <div className="p-2 rounded-xl bg-tertiary-fixed text-tertiary">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-headline font-bold text-on-surface">Nova Reunião</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <p className="text-sm text-error bg-error-container/20 px-4 py-2 rounded-lg" role="alert">
              {serverError}
            </p>
          )}

          <input type="hidden" {...register("project_id")} />

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Ex: Kickoff Meeting" {...register("title")} />
            {errors.title && (
              <p className="text-error text-[11px] font-medium">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_date">Data da Reunião</Label>
            <Input id="meeting_date" type="date" {...register("meeting_date")} />
            {errors.meeting_date && (
              <p className="text-error text-[11px] font-medium">{errors.meeting_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="raw_notes">Notas (opcional)</Label>
            <textarea
              id="raw_notes"
              className="block w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              placeholder="Anotações da reunião..."
              rows={4}
              {...register("raw_notes")}
            />
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
              {isSubmitting ? "Criando…" : "Criar Reunião"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
