"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateProjectStrategicInsightAction } from "@/server/actions/project-strategic-insight";
import { useLanguage } from "@/lib/i18n/language-context";

interface GenerateProjectStrategicInsightButtonProps {
  projectId: string;
  hasMeetings: boolean;
}

export function GenerateProjectStrategicInsightButton({
  projectId,
  hasMeetings,
}: GenerateProjectStrategicInsightButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateProjectStrategicInsightAction(projectId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      <Button
        type="button"
        onClick={handleGenerate}
        disabled={isPending || !hasMeetings}
        className="flex items-center gap-2 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-full px-5 py-2 font-bold disabled:opacity-50"
        title={!hasMeetings ? t("proj_strategic_insight_need_meetings") : undefined}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isPending ? t("proj_generating_strategic_insight") : t("proj_generate_strategic_insight")}
      </Button>
      {!hasMeetings && (
        <p className="text-xs text-on-surface-variant text-right max-w-[220px]">
          {t("proj_strategic_insight_need_meetings")}
        </p>
      )}
      {error && (
        <p className="text-xs text-error font-medium max-w-xs text-right">{error}</p>
      )}
    </div>
  );
}
