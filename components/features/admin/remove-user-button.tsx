"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col gap-6 border border-outline-variant/20">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-headline font-bold text-on-surface">{t("admin_remove_user")}?</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                <span className="font-bold text-on-surface">{userName}</span>{" "}
                {t("admin_remove_confirm")}
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
                onClick={handleRemove}
                disabled={isPending}
              >
                {isPending ? t("btn_removing") : t("btn_remove")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
