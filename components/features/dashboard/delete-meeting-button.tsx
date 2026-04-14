"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
        <ConfirmDialog
          title={t("confirm_delete_meeting_title")}
          description={t("confirm_delete_meeting_body")}
          confirmLabel={isPending ? t("btn_deleting") : t("btn_delete")}
          cancelLabel={t("btn_cancel")}
          isPending={isPending}
          error={error}
          onConfirm={handleDelete}
          onCancel={() => { setShowConfirm(false); setError(null); }}
        />
      )}
    </>
  );
}
