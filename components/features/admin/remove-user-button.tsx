"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { removeUserAction } from "@/server/actions/admin";
import { useLanguage } from "@/lib/i18n/language-context";

interface RemoveUserButtonProps {
  userId: string;
  userName: string;
  currentUserId: string;
}

export function RemoveUserButton({ userId, userName, currentUserId }: RemoveUserButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();
  const isSelf = userId === currentUserId;

  function handleRemove() {
    startTransition(async () => {
      const result = await removeUserAction(userId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setShowConfirm(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isSelf}
        className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title={isSelf ? t("admin_self_remove_warn") : t("admin_remove_user")}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {showConfirm && (
        <ConfirmDialog
          title={`${t("admin_remove_user")}?`}
          description={
            <>
              <span className="font-bold text-on-surface">{userName}</span>{" "}
              {t("admin_remove_confirm")}
            </>
          }
          confirmLabel={isPending ? t("btn_removing") : t("btn_remove")}
          cancelLabel={t("btn_cancel")}
          isPending={isPending}
          error={error}
          onConfirm={handleRemove}
          onCancel={() => { setShowConfirm(false); setError(null); }}
        />
      )}
    </>
  );
}
