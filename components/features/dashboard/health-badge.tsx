"use client";

import { HealthStatus } from "@/lib/types/domain";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";

interface HealthBadgeProps {
  status: HealthStatus;
  className?: string;
}

const statusToKey: Record<HealthStatus, TranslationKey> = {
  ok: "health_badge_ok",
  warning: "health_badge_warning",
  critical: "health_badge_critical",
};

export function HealthBadge({ status, className }: HealthBadgeProps) {
  const { t } = useLanguage();

  const variants = {
    ok: "bg-secondary/10 text-secondary",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-500",
    critical: "bg-error/10 text-error",
  };

  const dotColors = {
    ok: "bg-secondary",
    warning: "bg-amber-500",
    critical: "bg-error",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
        variants[status],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[status])} />
      {t(statusToKey[status])}
    </span>
  );
}
