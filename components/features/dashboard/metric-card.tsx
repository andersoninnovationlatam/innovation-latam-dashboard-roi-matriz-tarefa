import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  badge?: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  borderColor: string;
  badgeColor?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  badge,
  icon: Icon,
  iconBgColor,
  iconColor,
  borderColor,
  badgeColor,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-low p-6 rounded-xl border-b-4 hover:bg-surface-container transition-colors group",
        borderColor,
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-lg", iconBgColor)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        {badge && (
          <span
            className={cn(
              "text-xs font-bold px-2 py-1 rounded-full",
              badgeColor || iconColor
            )}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">
        {label}
      </p>
      <h3 className="text-4xl font-extrabold font-headline text-on-surface">
        {value}
      </h3>
    </div>
  );
}
