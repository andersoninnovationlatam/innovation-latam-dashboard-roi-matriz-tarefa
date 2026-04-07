"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CreateMeetingForm } from "@/components/features/forms/create-meeting-form";

interface NewMeetingButtonProps {
  projectId: string;
  isGestor?: boolean;
}

export function NewMeetingButton({ projectId, isGestor = false }: NewMeetingButtonProps) {
  const [open, setOpen] = useState(false);

  if (!isGestor) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
      >
        <Plus className="w-4 h-4" />
        New Meeting
      </button>
      {open && <CreateMeetingForm projectId={projectId} onClose={() => setOpen(false)} />}
    </>
  );
}
