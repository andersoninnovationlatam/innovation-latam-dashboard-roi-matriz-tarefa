"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateInsightsAction } from "@/server/actions/ai-insights";
import { useLanguage } from "@/lib/i18n/language-context";

interface GenerateInsightsButtonProps {
  meetingId: string;
  hasNotes: boolean;
}

export function GenerateInsightsButton({ meetingId, hasNotes }: GenerateInsightsButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateInsightsAction(meetingId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={handleGenerate}
        disabled={isPending || !hasNotes}
        className="flex items-center gap-2 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-full px-5 py-2 font-bold disabled:opacity-50"
        title={!hasNotes ? t("meet_add_notes") : undefined}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isPending ? t("meet_generating") : t("meet_generate_insights")}
      </Button>
      {!hasNotes && (
        <p className="text-xs text-on-surface-variant">{t("meet_add_notes")}</p>
      )}
      {error && (
        <p className="text-xs text-error font-medium max-w-xs text-right">{error}</p>
      )}
    </div>
  );
}
