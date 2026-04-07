"use client";

import { ClientCard } from "@/components/features/dashboard/client-card";
import { MetricCard } from "@/components/features/dashboard/metric-card";
import { NewClientButton } from "@/components/features/dashboard/new-client-button";
import { Users, Rocket, AlertTriangle, Calendar } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { ClientOverviewItem } from "@/server/actions/clients";

interface DashboardHomeViewProps {
  clientsData: ClientOverviewItem[];
  isGestor: boolean;
  totalClients: number;
  totalProjects: number;
  criticalCount: number;
  totalMeetings: number;
}

export function DashboardHomeView({
  clientsData,
  isGestor,
  totalClients,
  totalProjects,
  criticalCount,
  totalMeetings,
}: DashboardHomeViewProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-[1600px] mx-auto p-12 space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">
            {t("dash_main_title")}
          </h2>
          <p className="text-on-surface-variant font-medium mt-1">{t("dash_main_subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <NewClientButton isGestor={isGestor} />
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label={t("dash_metric_total_clients")}
          value={totalClients}
          badge={t("dash_active")}
          icon={Users}
          iconBgColor="bg-primary-fixed"
          iconColor="text-primary"
          borderColor="border-primary/20"
          badgeColor="text-primary bg-primary/5"
        />
        <MetricCard
          label={t("dash_metric_total_projects")}
          value={totalProjects}
          badge={t("dash_active")}
          icon={Rocket}
          iconBgColor="bg-secondary-container"
          iconColor="text-secondary"
          borderColor="border-secondary/20"
          badgeColor="text-secondary bg-secondary/5"
        />
        <MetricCard
          label={t("dash_metric_critical_alerts")}
          value={criticalCount}
          badge={t("dash_badge_urgent")}
          icon={AlertTriangle}
          iconBgColor="bg-error-container"
          iconColor="text-error"
          borderColor="border-error/20"
          badgeColor="text-error bg-error/5"
        />
        <MetricCard
          label={t("dash_metric_total_meetings")}
          value={totalMeetings}
          badge={t("dash_badge_monthly")}
          icon={Calendar}
          iconBgColor="bg-tertiary-fixed"
          iconColor="text-tertiary"
          borderColor="border-tertiary-container/20"
          badgeColor="text-tertiary bg-tertiary/5"
        />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-headline text-on-surface">
            {t("dash_portfolio_health")}
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-xs font-semibold text-on-surface-variant mr-4">
              {t("dash_legend_healthy")}
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-on-surface-variant mr-4">
              {t("proj_at_risk")}
            </span>
            <span className="w-2 h-2 rounded-full bg-error" />
            <span className="text-xs font-semibold text-on-surface-variant">
              {t("dash_legend_critical")}
            </span>
          </div>
        </div>
        {clientsData.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <p>{t("dash_empty_no_clients")}</p>
            <p className="text-sm mt-2">{t("dash_empty_clients_hint")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {clientsData.map(
              ({
                client,
                latestHealth,
                latestMeeting,
                parecerExcerpt,
                activeProjects,
              }) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  latestHealth={latestHealth}
                  latestMeeting={latestMeeting}
                  parecerExcerpt={parecerExcerpt}
                  activeProjects={activeProjects}
                />
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}
