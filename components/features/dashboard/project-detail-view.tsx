"use client";

import Link from "next/link";
import { NewMeetingButton } from "@/components/features/dashboard/new-meeting-button";
import { DeleteProjectButton } from "@/components/features/dashboard/delete-project-button";
import { GenerateProjectStrategicInsightButton } from "@/components/features/dashboard/generate-project-strategic-insight-button";
import {
  ChevronRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { ProjectStrategicInsightPayload } from "@/lib/schemas/project-strategic-insight";

export type ProjectMeetingRow = {
  id: string;
  title: string;
  meeting_date: string;
  healthStatus: string;
};

interface ProjectDetailViewProps {
  clienteId: string;
  projetoId: string;
  projectName: string;
  projectDescription: string | null;
  projectHealth: string;
  /** Insight gerado por IA e persistido em `projects.ai_strategic_insight`. */
  strategicInsight: ProjectStrategicInsightPayload | null;
  /** Pelo menos uma reunião (necessário para gerar insight manual). */
  hasMeetings: boolean;
  clientName: string | null;
  meetings: ProjectMeetingRow[];
  isGestor: boolean;
}

function getHealthIcon(health: string) {
  switch (health) {
    case "critical":
      return <AlertCircle className="w-5 h-5" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5" />;
    default:
      return <CheckCircle className="w-5 h-5" />;
  }
}

function getHealthBg(health: string) {
  switch (health) {
    case "critical":
      return "bg-error/10 text-error";
    case "warning":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-500";
    default:
      return "bg-tertiary-fixed text-on-tertiary-fixed-variant";
  }
}

function meetingStatusKey(health: string): TranslationKey {
  if (health === "critical") return "proj_meet_status_critical";
  if (health === "warning") return "proj_meet_status_warning";
  return "proj_meet_status_ok";
}

export function ProjectDetailView({
  clienteId,
  projetoId,
  projectName,
  projectDescription,
  projectHealth,
  strategicInsight,
  hasMeetings,
  clientName,
  meetings,
  isGestor,
}: ProjectDetailViewProps) {
  const { lang, t } = useLanguage();
  const locale = lang === "pt" ? "pt-BR" : "en-US";

  const projectHealthLabel =
    projectHealth === "critical"
      ? t("proj_critical")
      : projectHealth === "warning"
        ? t("proj_at_risk")
        : t("proj_active");

  return (
    <main className="max-w-[1600px] mx-auto p-12">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-on-surface-variant font-label text-sm mb-4">
          <Link href="/dashboard/clientes" className="font-medium hover:text-primary">
            {t("dash_clients_title")}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href={`/dashboard/clientes/${clienteId}`}
            className="font-medium hover:text-primary"
          >
            {clientName || t("proj_breadcrumb_client_fallback")}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary font-semibold">{projectName}</span>
        </div>
        <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-start">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-3 font-headline">
              {projectName}
            </h1>
            <p className="text-on-surface-variant font-body leading-relaxed">
              {projectDescription || t("proj_no_description")}
            </p>
          </div>
          <div className="flex flex-col items-end gap-4 shrink-0">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">
                {t("proj_overall_health")}
              </span>
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full font-bold",
                  projectHealth === "critical"
                    ? "bg-error-container text-on-error-container"
                    : projectHealth === "warning"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-500"
                      : "bg-secondary-container text-on-secondary-container"
                )}
              >
                {getHealthIcon(projectHealth)}
                {projectHealthLabel}
              </div>
            </div>
            {isGestor && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl border-outline-variant/40 shadow-sm"
                  title={t("proj_edit")}
                  aria-label={t("proj_edit")}
                >
                  <Edit className="w-5 h-5" />
                </Button>
                <DeleteProjectButton
                  projectId={projetoId}
                  clienteId={clienteId}
                  className="!w-10 !h-10 rounded-xl shadow-sm hover:!scale-100 active:!scale-100"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                {t("proj_velocity")}
              </span>
              <div className="text-3xl font-headline font-extrabold text-primary">84%</div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[84%]" />
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                {t("proj_resources")}
              </span>
              <div className="text-3xl font-headline font-extrabold text-secondary">12/15</div>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-surface-container-low bg-surface-container-high"
                  />
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-surface-container-low flex items-center justify-center bg-secondary text-[8px] text-on-secondary">
                  +9
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                {t("proj_milestone")}
              </span>
              <div className="text-3xl font-headline font-extrabold text-tertiary">14d</div>
              <div className="text-xs text-on-surface-variant font-medium">
                {t("proj_mock_milestone_name")}
              </div>
            </div>
          </div>

          <section className="bg-white/50 dark:bg-surface-container-low dark:backdrop-blur-none backdrop-blur-md rounded-xl p-8 shadow-sm border border-outline-variant/15 dark:border-outline-variant/25">
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary shrink-0" />
                {t("proj_ai_insight")}
              </h2>
              {isGestor && (
                <GenerateProjectStrategicInsightButton
                  projectId={projetoId}
                  hasMeetings={hasMeetings}
                />
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-body text-on-surface-variant mb-4">
                  {strategicInsight?.body ?? t("proj_ai_insight_empty")}
                </p>
                {strategicInsight && (
                  <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold">
                    <TrendingUp className="w-3 h-3" />
                    {strategicInsight.tag}
                  </div>
                )}
              </div>
              <div className="bg-surface-container rounded-xl p-4">
                <div className="text-[10px] text-on-surface-variant uppercase font-bold mb-3">
                  {t("proj_actions")}
                </div>
                {strategicInsight ? (
                  <ul className="space-y-3">
                    {strategicInsight.actions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-medium">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-on-surface-variant">{t("proj_ai_insight_empty_actions")}</p>
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-headline font-bold">{t("proj_meeting_history")}</h2>
              <NewMeetingButton projectId={projetoId} isGestor={isGestor} />
            </div>
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/dashboard/clientes/${clienteId}/projetos/${projetoId}/reunioes/${meeting.id}`}
                  className="group bg-surface-container-lowest hover:bg-surface-container-low transition-all p-5 rounded-xl flex items-center justify-between cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-5">
                    <div className={cn("p-3 rounded-xl", getHealthBg(meeting.healthStatus))}>
                      {getHealthIcon(meeting.healthStatus)}
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">
                        {meeting.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-medium text-on-surface-variant">
                          {new Date(meeting.meeting_date).toLocaleDateString(locale, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant" />
                        <span
                          className={cn(
                            "text-xs font-bold uppercase tracking-tighter",
                            meeting.healthStatus === "critical"
                              ? "text-error"
                              : meeting.healthStatus === "warning"
                                ? "text-amber-700 dark:text-amber-500"
                                : "text-tertiary"
                          )}
                        >
                          {t("proj_status_label")}{" "}
                          {t(meetingStatusKey(meeting.healthStatus))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <div className="bg-surface-container p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BarChart3 className="w-32 h-32 text-on-surface-variant" />
            </div>
            <div className="relative z-10">
              <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                {t("proj_active_sprint")}
              </span>
              <div className="mt-4">
                <div className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">
                  {t("proj_lead_client")}
                </div>
                <div className="text-xl font-headline font-bold text-primary">
                  {clientName || "N/A"}
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-on-surface-variant">{t("proj_arch_readiness")}</span>
                  <span>65%</span>
                </div>
                <div className="h-1 bg-surface-container-highest rounded-full">
                  <div className="h-full bg-secondary w-[65%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-high p-8 rounded-xl">
            <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">
              {t("proj_upcoming_actions")}
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-error" />
                  <div className="w-px h-10 bg-outline-variant mt-2" />
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">
                    {t("proj_action_api_freeze")}
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-1">{t("proj_due_2_days")}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-outline" />
                  <div className="w-px h-10 bg-outline-variant mt-2" />
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">
                    {t("proj_action_compliance")}
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-1">{t("proj_due_5_days")}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-outline" />
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">
                    {t("proj_action_cloud_audit")}
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-1">{t("proj_due_8_days")}</div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-8 py-2 text-xs font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
            >
              {t("proj_expand_roadmap")}
            </Button>
          </div>

          <div className="bg-tertiary-container/10 p-8 rounded-xl border border-tertiary-container/10">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-tertiary" />
              <h2 className="text-sm font-bold text-tertiary">{t("proj_resource_burn")}</h2>
            </div>
            <div className="text-2xl font-headline font-bold text-on-background mb-1">
              {t("proj_optimized")}
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">{t("proj_resource_burn_body")}</p>
          </div>
        </div>
      </div>

    </main>
  );
}
