"use client";

import Link from "next/link";
import { DeleteMeetingButton } from "@/components/features/dashboard/delete-meeting-button";
import {
  ChevronRight,
  User,
  Brain,
  CheckCircle2,
  Network,
  Lightbulb,
  Thermometer,
  Calendar,
  ClipboardCheck,
  Code,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Circle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";
import type {
  HealthStatus,
  Participant,
  RiskItem,
  DeliveryItem,
  Commitment,
} from "@/lib/types/domain";

type AutomationStep = {
  step?: number;
  description: string;
  suggestion?: "ia" | "hibrido" | "humano";
  rationale?: string;
};

type ClientPendingAction = {
  action: string;
  responsible: string;
  deadline?: string | null;
};

export function MeetingInsightUnavailable({
  clienteId,
  projetoId,
}: {
  clienteId: string;
  projetoId: string;
}) {
  const { t } = useLanguage();

  return (
    <main className="max-w-[1440px] mx-auto p-12">
      <div className="text-center py-12 flex flex-col items-center gap-6">
        <p className="text-on-surface-variant">{t("meet_insights_unavailable")}</p>
        <Link
          href={`/dashboard/clientes/${clienteId}/projetos/${projetoId}`}
          className="text-primary font-bold text-sm hover:underline"
        >
          {t("meet_back_to_project")}
        </Link>
      </div>
    </main>
  );
}

export interface MeetingInsightViewProps {
  clienteId: string;
  projetoId: string;
  reuniaoId: string;
  canDelete: boolean;
  projectName: string | null;
  meetingTitle: string;
  healthStatus: HealthStatus;
  participants: Participant[];
  risks: RiskItem[];
  deliveries: DeliveryItem[];
  automationFramework: AutomationStep[];
  techStack: string[];
  techInputs: string[];
  mainPain: string;
  impactScore: string | number;
  executiveSummary: string | null;
  temperaturaLevel: string;
  temperaturaSignals: string[];
  commitments: Commitment[];
  clientPending: ClientPendingAction[];
  parecerGeral: string | null;
}

function archetypeLabel(participant: Participant, t: (k: TranslationKey) => string): string {
  switch (participant.archetype) {
    case "visionario":
      return t("meet_archetype_visionario");
    case "cetico":
      return t("meet_archetype_cetico");
    case "executor":
      return t("meet_archetype_executor");
    default:
      return t("meet_archetype_decisor");
  }
}

export function MeetingInsightView({
  clienteId,
  projetoId,
  reuniaoId,
  canDelete,
  projectName,
  meetingTitle,
  healthStatus,
  participants,
  risks,
  deliveries,
  automationFramework,
  techStack,
  techInputs,
  mainPain,
  impactScore,
  executiveSummary,
  temperaturaLevel,
  temperaturaSignals,
  commitments,
  clientPending,
  parecerGeral,
}: MeetingInsightViewProps) {
  const { lang, t } = useLanguage();
  const locale = lang === "pt" ? "pt-BR" : "en-US";

  const execSummary =
    executiveSummary?.trim() ? executiveSummary : t("meet_no_exec_summary");
  const parecerText = parecerGeral?.trim() ? parecerGeral : t("meet_no_parecer_fallback");

  const healthBgColor =
    healthStatus === "critical"
      ? "bg-error-container/20 border-error/20"
      : healthStatus === "warning"
        ? "bg-amber-100/20 border-amber-500/20"
        : "bg-secondary-container/20 border-secondary/20";

  const statusLabels: Record<string, string> = {
    defined: t("meet_commit_defined"),
    to_confirm: t("meet_commit_to_confirm"),
    delivered: t("meet_commit_delivered"),
  };

  const healthPillLabel =
    healthStatus === "critical"
      ? t("meet_health_critical_label")
      : healthStatus === "warning"
        ? t("meet_health_warning_label")
        : t("meet_health_ok_label");

  return (
    <main className="max-w-[1440px] mx-auto p-12">
      <div className="mb-12">
        <div className="flex items-center gap-2 text-outline text-sm mb-2">
          <Link
            href={`/dashboard/clientes/${clienteId}/projetos/${projetoId}`}
            className="font-medium hover:text-primary"
          >
            {projectName || t("proj_breadcrumb_project_fallback")}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary font-medium">{meetingTitle}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">
            {t("meet_insight_panel")}
          </h1>
          <div className="flex items-center gap-3 pt-1">
            {canDelete && (
              <DeleteMeetingButton
                meetingId={reuniaoId}
                clienteId={clienteId}
                projetoId={projetoId}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4 border-l-4 border-primary">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-headline font-bold text-lg">{t("meet_agent_perfilador")}</h2>
          </div>
          <div className="space-y-4">
            {participants.length === 0 && (
              <p className="text-sm text-on-surface-variant italic">{t("meet_empty_participants")}</p>
            )}
            {participants.map((participant, idx) => {
              const initials = (participant.name ?? "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const bgColors = ["bg-primary-fixed", "bg-secondary-fixed", "bg-tertiary-fixed"];
              const textColors = ["text-primary", "text-secondary", "text-tertiary"];
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                      bgColors[idx % 3],
                      textColors[idx % 3]
                    )}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{participant.name}</div>
                    <div className="text-[11px] text-outline-variant uppercase font-bold tracking-tighter">
                      {archetypeLabel(participant, t)} • {t("meet_drive_label")}{" "}
                      {participant.driver ?? t("client_card_na")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-error" />
            <h2 className="font-headline font-bold text-lg">{t("meet_agent_advogado")}</h2>
          </div>
          <ul className="space-y-3">
            {risks.length === 0 && (
              <li className="text-sm text-on-surface-variant italic">{t("meet_no_risks")}</li>
            )}
            {risks.map((risk, idx) => {
              const severity = risk.severity ?? "info";
              const bgColors: Record<string, string> = {
                critical: "bg-error-container/30",
                warning: "bg-amber-100/50 dark:bg-amber-500/20",
                info: "bg-blue-50 dark:bg-blue-500/20",
              };
              const iconColors: Record<string, string> = {
                critical: "text-error",
                warning: "text-amber-600 dark:text-amber-500",
                info: "text-blue-600 dark:text-blue-500",
              };
              const icons: Record<string, typeof AlertCircle> = {
                critical: AlertCircle,
                warning: AlertTriangle,
                info: Info,
              };
              const Icon = icons[severity] ?? Info;
              return (
                <li
                  key={idx}
                  className={cn("flex items-start gap-3 p-3 rounded-lg", bgColors[severity])}
                >
                  <Icon className={cn("w-4 h-4 mt-0.5", iconColors[severity])} />
                  <div className="text-sm font-medium">{risk.description}</div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-secondary" />
            <h2 className="font-headline font-bold text-lg">{t("meet_agent_auditor")}</h2>
          </div>
          <div className="space-y-2">
            {deliveries.length === 0 && (
              <p className="text-sm text-on-surface-variant italic">{t("meet_no_deliveries")}</p>
            )}
            {deliveries.map((delivery, idx) => {
              const status = delivery.status ?? "pending";
              const statusIcons: Record<string, typeof CheckCircle> = {
                approved: CheckCircle,
                approved_with_caveats: AlertTriangle,
                pending: Circle,
                blocked: XCircle,
              };
              const statusColors: Record<string, string> = {
                approved: "text-green-600",
                approved_with_caveats: "text-amber-500",
                pending: "text-outline",
                blocked: "text-error",
              };
              const Icon = statusIcons[status] ?? Circle;
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    status === "blocked" ? "bg-error-container/20" : "bg-surface-container-lowest",
                    status === "pending" && "opacity-50"
                  )}
                >
                  <span className="text-sm font-medium">{delivery.item}</span>
                  <Icon className={cn("w-5 h-5", statusColors[status])} />
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Network className="w-5 h-5 text-tertiary" />
            <h2 className="font-headline font-bold text-lg">{t("meet_agent_arquiteto")}</h2>
          </div>
          <div className="relative space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant">
            {automationFramework.length === 0 && (
              <p className="text-sm text-on-surface-variant italic pl-8">{t("meet_no_automation")}</p>
            )}
            {automationFramework.map((step, idx) => {
              const suggestion = step.suggestion ?? "humano";
              const bgColors: Record<string, string> = {
                ia: "bg-secondary-container",
                hibrido: "bg-primary-fixed",
                humano: "bg-tertiary-fixed",
              };
              const textColors: Record<string, string> = {
                ia: "text-secondary",
                hibrido: "text-primary",
                humano: "text-tertiary",
              };
              return (
                <div key={idx} className="relative pl-8">
                  <div
                    className={cn(
                      "absolute left-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10",
                      bgColors[suggestion],
                      textColors[suggestion]
                    )}
                  >
                    {suggestion === "ia"
                      ? "IA"
                      : suggestion === "hibrido"
                        ? t("meet_badge_hibrido_short")
                        : t("meet_badge_hum_short")}
                  </div>
                  <div className="text-sm font-bold">{step.description}</div>
                  <p className="text-xs text-on-surface-variant">{step.rationale}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h2 className="font-headline font-bold text-lg">{t("meet_agent_estrategista")}</h2>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-headline font-black text-primary">{impactScore}</span>
            <span className="text-sm font-bold text-outline uppercase tracking-wider">
              {t("meet_strategic_impact")}
            </span>
          </div>
          <div className="bg-primary-fixed/30 p-4 rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              {t("meet_executive_summary")}
            </h3>
            <p className="text-sm text-on-surface leading-relaxed">{execSummary}</p>
          </div>
          <Button
            variant="ghost"
            className="mt-auto flex items-center justify-between w-full p-3 bg-surface-container-highest rounded-lg text-sm font-bold hover:bg-surface-dim transition-colors group"
          >
            {t("meet_view_followup_email")}
            <ArrowRight className="w-4 h-4 text-outline group-hover:translate-x-1 transition-transform" />
          </Button>
        </section>

        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-5 h-5 text-error" />
            <h2 className="font-headline font-bold text-lg">{t("meet_agent_temperatura")}</h2>
          </div>
          <div
            className={cn(
              "flex flex-col items-center py-4 rounded-2xl border",
              temperaturaLevel === "high"
                ? "bg-error-container/10 border-error/10"
                : temperaturaLevel === "moderate"
                  ? "bg-amber-100/10 border-amber-500/10"
                  : "bg-secondary-container/10 border-secondary/10"
            )}
          >
            <span
              className={cn(
                "text-5xl font-headline font-black uppercase",
                temperaturaLevel === "high"
                  ? "text-error"
                  : temperaturaLevel === "moderate"
                    ? "text-amber-500"
                    : "text-secondary"
              )}
            >
              {temperaturaLevel === "high"
                ? t("meet_temp_high")
                : temperaturaLevel === "moderate"
                  ? t("meet_temp_moderate")
                  : t("meet_temp_low")}
            </span>
            <span
              className={cn(
                "text-xs font-bold uppercase tracking-widest mt-1",
                temperaturaLevel === "high"
                  ? "text-error"
                  : temperaturaLevel === "moderate"
                    ? "text-amber-500"
                    : "text-secondary"
              )}
            >
              {temperaturaLevel === "high"
                ? t("meet_temp_rupture")
                : temperaturaLevel === "moderate"
                  ? t("meet_temp_attention")
                  : t("meet_temp_stable")}
            </span>
          </div>
          <ul className="space-y-3 mt-2">
            {temperaturaSignals.map((signal, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    temperaturaLevel === "high"
                      ? "bg-error"
                      : temperaturaLevel === "moderate"
                        ? "bg-amber-500"
                        : "bg-secondary"
                  )}
                />
                {signal}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-secondary" />
            <h2 className="font-headline font-bold text-lg">{t("meet_agent_compromissos")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 text-outline text-[11px] uppercase tracking-widest font-bold">
                  <th className="pb-3 px-2">{t("meet_col_who")}</th>
                  <th className="pb-3 px-2">{t("meet_col_what")}</th>
                  <th className="pb-3 px-2">{t("meet_col_deadline")}</th>
                  <th className="pb-3 px-2 text-right">{t("meet_col_status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {commitments.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-center text-on-surface-variant italic text-sm"
                    >
                      {t("meet_no_commitments")}
                    </td>
                  </tr>
                )}
                {commitments.map((commitment, idx) => {
                  const status = commitment.status ?? "to_confirm";
                  const statusColors: Record<string, string> = {
                    defined: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-500",
                    to_confirm: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-500",
                    delivered: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-500",
                  };
                  return (
                    <tr key={idx}>
                      <td className="py-4 px-2 font-bold">{commitment.who}</td>
                      <td className="py-4 px-2">{commitment.what}</td>
                      <td className="py-4 px-2 text-outline-variant font-mono">
                        {commitment.deadline
                          ? new Date(commitment.deadline).toLocaleDateString(locale, {
                              day: "2-digit",
                              month: "short",
                            })
                          : t("client_card_na")}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
                            statusColors[status]
                          )}
                        >
                          {statusLabels[status] ?? status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            <h2 className="font-headline font-bold text-lg">{t("meet_agent_validacao")}</h2>
          </div>
          <div className="space-y-4">
            <div className="text-[11px] font-bold text-outline-variant uppercase tracking-widest">
              {t("meet_client_pending_actions")}
            </div>
            {clientPending.length === 0 && (
              <p className="text-sm text-on-surface-variant italic">{t("meet_no_pending")}</p>
            )}
            {clientPending.map((action, idx) => (
              <div
                key={idx}
                className="p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-xl flex items-start gap-3"
              >
                <ClipboardCheck className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm font-bold">{action.action}</div>
                  <div className="text-xs text-outline-variant mt-1">
                    {t("meet_responsible")} {action.responsible}
                    {action.deadline &&
                      ` • ${t("meet_deadline_label")} ${new Date(action.deadline).toLocaleDateString(locale)}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4 lg:col-span-3">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-5 h-5 text-tertiary" />
            <h2 className="font-headline font-bold text-lg">{t("meet_agent_contexto_tecnico")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-[11px] font-bold text-outline-variant uppercase tracking-widest mb-3">
                {t("meet_stack_discussion")}
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack.length === 0 && (
                  <span className="text-sm text-on-surface-variant italic">{t("meet_no_tech")}</span>
                )}
                {techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="bg-secondary-fixed text-on-secondary-fixed text-xs font-bold px-3 py-1.5 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-outline-variant uppercase tracking-widest mb-3">
                {t("meet_main_inputs")}
              </div>
              <ul className="space-y-2">
                {techInputs.length === 0 && (
                  <li className="text-sm text-on-surface-variant italic">{t("meet_no_inputs")}</li>
                )}
                {techInputs.map((input, idx) => (
                  <li key={idx} className="text-sm flex items-center gap-2">
                    <Code className="w-3 h-3" />
                    {input}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-on-surface text-surface rounded-xl p-5 shadow-xl">
              <div className="text-[10px] font-bold text-outline-variant uppercase tracking-widest mb-1">
                {t("meet_main_pain_label")}
              </div>
              <div className="text-lg font-headline font-bold italic leading-tight">
                &ldquo;{mainPain}&rdquo;
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        className={cn(
          "rounded-2xl p-10 flex flex-col gap-6 relative overflow-hidden border",
          healthBgColor
        )}
      >
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-error/5 blur-3xl" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-black tracking-widest",
                  healthStatus === "critical"
                    ? "bg-error text-on-error"
                    : healthStatus === "warning"
                      ? "bg-amber-500 text-on-surface"
                      : "bg-secondary text-on-secondary"
                )}
              >
                {healthPillLabel}
              </div>
              <h2 className="text-3xl font-headline font-black text-on-surface tracking-tight">
                {t("meet_parecer_geral")}
              </h2>
            </div>
            <p className="text-lg text-on-surface-variant max-w-4xl leading-relaxed">{parecerText}</p>
          </div>
          <div className="hidden lg:flex flex-col items-end">
            <div className="text-[11px] font-bold text-outline uppercase tracking-widest mb-2">
              {t("meet_project_health")}
            </div>
            <div className="flex gap-1">
              <div
                className={cn(
                  "w-12 h-2 rounded-full",
                  healthStatus === "critical"
                    ? "bg-error"
                    : healthStatus === "warning"
                      ? "bg-amber-500"
                      : "bg-secondary"
                )}
              />
              <div className="w-12 h-2 rounded-full bg-outline-variant/30" />
              <div className="w-12 h-2 rounded-full bg-outline-variant/30" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
