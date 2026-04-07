"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateUserRoleAction } from "@/server/actions/admin";
import { useLanguage } from "@/lib/i18n/language-context";
import type { UserRole } from "@/lib/types/domain";

interface EditUserRoleProps {
  userId: string;
  currentRole: UserRole;
  currentUserId: string;
}

export function EditUserRole({ userId, currentRole, currentUserId }: EditUserRoleProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<UserRole>(currentRole);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();
  const isSelf = userId === currentUserId;

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateUserRoleAction(userId, selected);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={isSelf}
        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title={isSelf ? t("admin_self_role_warn") : t("admin_change_role")}
      >
        <Pencil className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col gap-6 border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-headline font-bold text-on-surface">{t("admin_change_role")}</h2>
              <button
                onClick={() => { setOpen(false); setError(null); }}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {(["viewer", "consultor", "gestor"] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelected(role)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold text-left capitalize transition-colors border ${
                    selected === role
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant/30 hover:bg-surface-container-low text-on-surface"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {error && <p className="text-sm text-error font-medium">{error}</p>}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setOpen(false); setError(null); }}
                disabled={isPending}
              >
                {t("btn_cancel")}
              </Button>
              <Button
                className="flex-1 bg-primary text-on-primary hover:bg-primary/90"
                onClick={handleSave}
                disabled={isPending || selected === currentRole}
              >
                {isPending ? t("btn_saving") : t("btn_save")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
