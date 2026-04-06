"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { CreateProjectForm } from "@/components/features/forms/create-project-form";

interface NewProjectButtonProps {
  clientId: string;
}

export function NewProjectButton({ clientId }: NewProjectButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
      >
        <PlusCircle className="w-4 h-4" />
        New Project
      </button>
      {open && <CreateProjectForm clientId={clientId} onClose={() => setOpen(false)} />}
    </>
  );
}
