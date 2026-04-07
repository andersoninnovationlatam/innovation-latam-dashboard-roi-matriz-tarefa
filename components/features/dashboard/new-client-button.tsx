"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CreateClientForm } from "@/components/features/forms/create-client-form";
import { useLanguage } from "@/lib/i18n/language-context";

interface NewClientButtonProps {
  /** Somente gestor pode criar clientes (RLS + UI). */
  isGestor?: boolean;
}

export function NewClientButton({ isGestor = false }: NewClientButtonProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  if (!isGestor) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform"
      >
        <Plus className="w-4 h-4" />
        {t("dash_new_client")}
      </button>
      {open && <CreateClientForm onClose={() => setOpen(false)} />}
    </>
  );
}
