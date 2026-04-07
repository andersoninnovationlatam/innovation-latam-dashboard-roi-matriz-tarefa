"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMeetingAction } from "@/server/actions/delete";
import { useLanguage } from "@/lib/i18n/language-context";

interface DeleteMeetingButtonProps {
  meetingId: string;
  clienteId: string;
  projetoId: string;
}

export function DeleteMeetingButton({ meetingId, clienteId, projetoId }: DeleteMeetingButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMeetingAction(meetingId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push(`/dashboard/clientes/${clienteId}/projetos/${projetoId}`);
    });
  }

  return (
    <>
      <Button
        variant="outline"
        className="border-error/40 text-error bg-error-container/10 flex items-center gap-2 hover:bg-error/10 transition-colors rounded-full px-4 py-2"
        onClick={() => setShowConfirm(true)}
      >
        <Trash2 className="w-4 h-4" />
        {t("meet_delete")}
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col gap-6 border border-outline-variant/20">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {t("confirm_delete_meeting_title")}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {t("confirm_delete_meeting_body")}
              </p>
            </div>
            {error && <p className="text-sm text-error font-medium">{error}</p>}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowConfirm(false); setError(null); }}
                disabled={isPending}
              >
                {t("btn_cancel")}
              </Button>
              <Button
                className="flex-1 bg-error text-on-error hover:bg-error/90"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? t("btn_deleting") : t("btn_delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
