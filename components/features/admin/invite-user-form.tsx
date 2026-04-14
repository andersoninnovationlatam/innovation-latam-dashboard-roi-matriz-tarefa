"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteUserAction } from "@/server/actions/admin";
import { useLanguage } from "@/lib/i18n/language-context";

const inviteFormSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email("E-mail inválido"),
  role: z.enum(["gestor", "consultor", "viewer"]),
});

type InviteFormInput = z.infer<typeof inviteFormSchema>;

export function InviteUserForm() {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormInput>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: { role: "viewer" },
  });

  function handleClose() {
    setOpen(false);
    setServerError(null);
    setSuccess(false);
    reset();
  }

  async function onSubmit(data: InviteFormInput) {
    setServerError(null);
    setSuccess(false);

    const result = await inviteUserAction(data);
    if (result?.error) {
      setServerError(result.error);
      return;
    }

    setSuccess(true);
    reset();
    setTimeout(() => {
      handleClose();
      router.refresh();
    }, 1500);
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
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {t("admin_invite_title")}
              </h2>
              <button
                onClick={handleClose}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="full_name">{t("admin_invite_name")}</Label>
                <Input
                  id="full_name"
                  placeholder={t("admin_invite_name")}
                  {...register("full_name")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">{t("admin_invite_email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-error text-[11px] font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="role">{t("admin_invite_role")}</Label>
                <select
                  id="role"
                  {...register("role")}
                  className="w-full border border-outline-variant/40 rounded-lg px-3 py-2 bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="viewer">Viewer</option>
                  <option value="consultor">Consultor</option>
                  <option value="gestor">Gestor</option>
                </select>
              </div>

              {serverError && (
                <p className="text-sm text-error font-medium">{serverError}</p>
              )}
              {success && (
                <p className="text-sm text-secondary font-medium">{t("admin_invite_success")}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  {t("btn_cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-on-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("btn_sending") : t("admin_invite_send")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
