"use client";

import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  isPending: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  isPending,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col gap-6 border border-outline-variant/20">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-headline font-bold text-on-surface">{title}</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
        </div>
        {error && <p className="text-sm text-error font-medium">{error}</p>}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            className="flex-1 bg-error text-on-error hover:bg-error/90"
            onClick={onConfirm}
            disabled={isPending}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
