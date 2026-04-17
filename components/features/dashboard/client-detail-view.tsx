"use client";

import Link from "next/link";
import { HealthBadge } from "@/components/features/dashboard/health-badge";
import { NewProjectButton } from "@/components/features/dashboard/new-project-button";
import { AlertTriangle, Zap, ArrowRight, AlertCircle } from "lucide-react";
import { formatDateOnlyLocal } from "@/lib/date-only";
import { useLanguage } from "@/lib/i18n/language-context";
import type { HealthStatus, Meeting, ProjectStatus } from "@/lib/types/domain";
import type { TranslationKey } from "@/lib/i18n/translations";

export type ClientDetailProjectRow = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  healthStatus: HealthStatus;
  completion: number;
};

function projectStatusTranslationKey(status: ProjectStatus): TranslationKey {
  switch (status) {
    case "active":
      return "project_status_active";
    case "paused":
      return "project_status_paused";
    case "completed":
      return "project_status_completed";
    case "at_risk":
      return "project_status_at_risk";
    default:
      return "project_status_active";
  }
}

interface ClientDetailViewProps {
  clienteId: string;
  clientCode: string;
  clientName: string;
  clientHealth: HealthStatus;
  healthIndex: number;
  projects: ClientDetailProjectRow[];
  latestMeeting: Meeting | null;
  latestParecer: string | null;
  isGestor: boolean;
}

export function ClientDetailView({
  clienteId,
  clientCode,
  clientName,
  clientHealth,
  healthIndex,
  projects,
  latestMeeting,
  latestParecer,
  isGestor,
}: ClientDetailViewProps) {
  const { lang, t } = useLanguage();
  const locale = lang === "pt" ? "pt-BR" : "en-US";

  const healthColor =
    clientHealth === "critical"
      ? "bg-error"
      : clientHealth === "warning"
        ? "bg-amber-500"
        : "bg-secondary";

  return (
    <main className="max-w-[1600px] mx-auto p-12">
      <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
        <div className="md:col-span-2">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-surface-container-highest text-primary font-bold rounded-lg text-sm tracking-widest font-body">
              {clientCode}
            </span>
            <HealthBadge status={clientHealth} />
          </div>
          <h1 className="text-5xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">
            {clientName}
          </h1>
          {/*<p className="text-on-surface-variant text-lg max-w-2xl font-body">
            {t("client_detail_hero_placeholder")}
          </p>*/}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs font-bold text-outline uppercase tracking-widest">
            {t("client_detail_health_index")}
          </span>
          <div className="w-full bg-surface-container-high h-4 rounded-full overflow-hidden">
            <div
              className={`${healthColor} h-full rounded-full`}
              style={{ width: `${healthIndex}%` }}
            />
          </div>
          <span
            className={`text-3xl font-black font-headline ${clientHealth === "critical"
                ? "text-error"
                : clientHealth === "warning"
                  ? "text-amber-500"
                  : "text-secondary"
              }`}
          >
            {healthIndex}%
          </span>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-8 border-none">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-on-surface">
                {t("client_detail_strategic_initiatives")}
              </h2>
              <NewProjectButton clientId={clienteId} isGestor={isGestor} />
            </div>
            <div className="overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-on-surface-variant/60 text-[10px] uppercase tracking-[0.2em] font-bold">
                    <th className="pb-4">{t("client_detail_col_project_identity")}</th>
                    <th className="pb-4">{t("client_detail_col_project_status")}</th>
                    <th className="pb-4">{t("client_detail_col_health_status")}</th>
                    <th className="pb-4 text-right">{t("client_detail_col_completion")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="group hover:bg-surface-container transition-colors"
                    >
                      <td className="py-6">
                        <div className="flex flex-col">
                          <Link
                            href={`/dashboard/clientes/${clienteId}/projetos/${project.id}`}
                            className="text-on-surface font-semibold text-sm hover:text-primary transition-colors"
                          >
                            {project.name}
                          </Link>
                          <span className="text-xs text-on-surface-variant">
                            {project.description || t("client_detail_no_project_description")}
                          </span>
                        </div>
                      </td>
                      <td className="py-6">
                        <span className="text-sm font-medium text-on-surface">
                          {t(projectStatusTranslationKey(project.status))}
                        </span>
                      </td>
                      <td className="py-6">
                        <HealthBadge status={project.healthStatus} />
                      </td>
                      <td className="py-6 text-right">
                        <span className="font-headline font-bold text-on-surface">
                          {project.completion}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {latestMeeting && (
            <div className="bg-surface-container-highest rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-32 h-32 text-on-surface-variant" />
              </div>
              <div className="flex items-center gap-2 mb-4 text-secondary font-bold text-xs uppercase tracking-widest">
                <Zap className="w-3 h-3" />
                {t("client_detail_latest_insight")}
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">{latestMeeting.title}</h3>
              {latestParecer && (
                <div className="bg-white/50 dark:bg-surface-container-low/50 backdrop-blur-sm p-5 rounded-xl border-l-4 border-error mb-6">
                  <p className="text-on-surface-variant italic font-body text-sm leading-relaxed">
                    &ldquo;{latestParecer}&rdquo;
                  </p>
                </div>
              )}
              <Link
                href={`/dashboard/clientes/${clienteId}/projetos/${latestMeeting.project_id}/reunioes/${latestMeeting.id}`}
                className="inline-flex items-center gap-2 text-primary font-bold text-sm group"
              >
                {t("client_detail_full_meeting_history")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-8">
          <div className="bg-surface-container-low/80 backdrop-blur-md rounded-xl p-6 border border-outline-variant/10 shadow-sm">
            <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-6">
              {t("client_detail_engagement_overview")}
            </h4>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">
                  {t("client_detail_key_account_manager")}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-on-surface">
                    {t("client_detail_tbd")}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-surface-container-high" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">
                  {t("client_detail_contract_value")}
                </span>
                <span className="text-sm font-semibold text-on-surface">
                  {t("client_detail_tbd")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">
                  {t("client_detail_renewal_date")}
                </span>
                <span className="text-sm font-semibold text-error">{t("client_detail_tbd")}</span>
              </div>
            </div>
          </div>

          {clientHealth === "critical" && (
            <div className="bg-surface-container-high rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-error" />
                <h4 className="text-sm font-bold text-on-surface">
                  {t("client_detail_critical_blockers")}
                </h4>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/40 dark:bg-surface-container-low/40 rounded-lg border-none">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-error mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-on-surface">
                        {t("client_detail_action_required")}
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-1">
                        {t("client_detail_critical_body")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">
              {t("client_detail_pulse_timeline")}
            </h4>
            <div className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/30">
              {latestMeeting && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-primary border-4 border-surface" />
                  <p className="text-[11px] text-outline font-bold">
                    {formatDateOnlyLocal(latestMeeting.meeting_date, locale, {
                      month: "short",
                      day: "numeric",
                    }).toUpperCase()}
                  </p>
                  <p className="text-sm text-on-surface">
                    {t("client_detail_latest_meeting_prefix")}{" "}
                    <span className="font-semibold">{latestMeeting.title}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
