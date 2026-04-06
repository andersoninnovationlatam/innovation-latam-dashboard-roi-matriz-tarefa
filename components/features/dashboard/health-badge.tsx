import { HealthStatus } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

interface HealthBadgeProps {
  status: HealthStatus;
  className?: string;
}

export function HealthBadge({ status, className }: HealthBadgeProps) {
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

  const labels = {
    ok: "HEALTHY",
    warning: "WARNING",
    critical: "CRITICAL",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold",
        variants[status],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[status])} />
      {labels[status]}
    </span>
  );
}
