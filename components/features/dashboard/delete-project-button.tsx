"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteProjectAction } from "@/server/actions/delete";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface DeleteProjectButtonProps {
  projectId: string;
  clienteId: string;
  className?: string;
}

export function DeleteProjectButton({ projectId, clienteId, className }: DeleteProjectButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProjectAction(projectId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push(`/dashboard/clientes/${clienteId}`);
    });
  }

  return (
    <>
      <Button
        size="icon"
        className={cn(
          "w-14 h-14 bg-error-container text-error rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform",
          className
        )}
        onClick={() => setShowConfirm(true)}
      >
        <Trash2 className="w-6 h-6" />
      </Button>

      {showConfirm && (
        <ConfirmDialog
          title={t("confirm_delete_project_title")}
          description={t("confirm_delete_project_body")}
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
