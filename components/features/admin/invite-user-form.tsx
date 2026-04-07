"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteUserAction } from "@/server/actions/admin";
import { useLanguage } from "@/lib/i18n/language-context";
import type { UserRole } from "@/lib/types/domain";

export function InviteUserForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await inviteUserAction({
        email: formData.get("email") as string,
        role: formData.get("role") as UserRole,
        full_name: formData.get("full_name") as string,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      form.reset();
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        router.refresh();
      }, 1500);
    });
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-primary text-on-primary rounded-full px-5 py-2 font-bold hover:bg-primary/90"
      >
        <UserPlus className="w-4 h-4" />
        {t("admin_invite")}
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col gap-6 border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-headline font-bold text-on-surface">{t("admin_invite_title")}</h2>
              <button
                onClick={() => { setOpen(false); setError(null); }}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="full_name">{t("admin_invite_name")}</Label>
                <Input id="full_name" name="full_name" placeholder={t("admin_invite_name")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">{t("admin_invite_email")}</Label>
                <Input id="email" name="email" type="email" required placeholder="usuario@empresa.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="role">{t("admin_invite_role")}</Label>
                <select
                  id="role"
                  name="role"
                  required
                  defaultValue="viewer"
                  className="w-full border border-outline-variant/40 rounded-lg px-3 py-2 bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="viewer">Viewer</option>
                  <option value="consultor">Consultor</option>
                  <option value="gestor">Gestor</option>
                </select>
              </div>

              {error && <p className="text-sm text-error font-medium">{error}</p>}
              {success && (
                <p className="text-sm text-secondary font-medium">{t("admin_invite_success")}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setOpen(false); setError(null); }}
                  disabled={isPending}
                >
                  {t("btn_cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-on-primary hover:bg-primary/90"
                  disabled={isPending}
                >
                  {isPending ? t("btn_sending") : t("admin_invite_send")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
