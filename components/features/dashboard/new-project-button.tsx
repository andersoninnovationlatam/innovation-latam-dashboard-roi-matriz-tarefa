"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { CreateProjectForm } from "@/components/features/forms/create-project-form";
import { useLanguage } from "@/lib/i18n/language-context";

interface NewProjectButtonProps {
  clientId: string;
  isGestor?: boolean;
}

export function NewProjectButton({ clientId, isGestor = false }: NewProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  if (!isGestor) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
      >
        <PlusCircle className="w-4 h-4" />
        {t("nav_new_project")}
      </button>
      {open && <CreateProjectForm clientId={clientId} onClose={() => setOpen(false)} />}
    </>
  );
}
