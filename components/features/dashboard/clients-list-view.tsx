"use client";

import { ClientCard } from "@/components/features/dashboard/client-card";
import { NewClientButton } from "@/components/features/dashboard/new-client-button";
import { Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { ClientOverviewItem } from "@/server/actions/clients";

interface ClientsListViewProps {
  clientsData: ClientOverviewItem[];
  isGestor: boolean;
  totalClients: number;
  criticalCount: number;
  warningCount: number;
  okCount: number;
}

export function ClientsListView({
  clientsData,
  isGestor,
  totalClients,
  criticalCount,
  warningCount,
  okCount,
}: ClientsListViewProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-[1600px] mx-auto p-12 space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">
            {t("dash_clients_title")}
          </h2>
          <p className="text-on-surface-variant font-medium mt-1">{t("clients_list_subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <NewClientButton isGestor={isGestor} />
        </div>
      </header>

      <section className="flex flex-wrap gap-6">
        <div className="flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-xl">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {t("clients_summary_total")}
            </p>
            <p className="text-2xl font-headline font-extrabold text-on-surface">{totalClients}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-xl">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {t("dash_legend_healthy")}
            </p>
            <p className="text-2xl font-headline font-extrabold text-secondary">{okCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-xl">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {t("proj_at_risk")}
            </p>
            <p className="text-2xl font-headline font-extrabold text-amber-500">{warningCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-xl">
          <div className="w-3 h-3 rounded-full bg-error" />
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {t("dash_legend_critical")}
            </p>
            <p className="text-2xl font-headline font-extrabold text-error">{criticalCount}</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        {clientsData.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <p>{t("dash_empty_no_clients")}</p>
            <p className="text-sm mt-2">{t("dash_empty_clients_hint")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clientsData.map(
              ({ client, latestHealth, latestMeeting, parecerExcerpt, activeProjects }) => (
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
