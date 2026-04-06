import { notFound } from "next/navigation";
import Link from "next/link";
import { getMeetingInsights } from "@/server/actions/meetings";
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
import type { HealthStatus, Participant, RiskItem, DeliveryItem, Commitment } from "@/lib/types/domain";

interface MeetingInsightPageProps {
  params: Promise<{ clienteId: string; projetoId: string; reuniaoId: string }>;
}

export default async function MeetingInsightPage({ params }: MeetingInsightPageProps) {
  const { clienteId, projetoId, reuniaoId } = await params;

  let meetingData;
  try {
    meetingData = await getMeetingInsights(reuniaoId);
  } catch {
    notFound();
  }

  const { meeting, insights } = meetingData;
  const project = (meeting as any)?.projects;
  const client = project?.clients;

  if (!insights) {
    return (
      <main className="max-w-[1440px] mx-auto p-12">
        <div className="text-center py-12">
          <p className="text-on-surface-variant">Insights não disponíveis para esta reunião.</p>
          <Link
            href={`/dashboard/clientes/${clienteId}/projetos/${projetoId}`}
            className="text-primary font-bold text-sm mt-4 inline-block hover:underline"
          >
            ← Voltar ao projeto
          </Link>
        </div>
      </main>
    );
  }

  // Null-safe extraction of all JSONB fields
  const healthStatus: HealthStatus = insights.health_status ?? "ok";
  const participants: Participant[] = insights.perfilador?.participants ?? [];
  const risks: RiskItem[] = insights.advogado_diabo?.risks ?? [];
  const deliveries: DeliveryItem[] = insights.auditor_entregas?.deliveries ?? [];
  const automationFramework = insights.arquiteto?.automation_framework ?? [];
  const techStack: string[] = insights.contexto_tecnico?.stack ?? [];
  const techInputs: string[] = insights.contexto_tecnico?.inputs ?? [];
  const mainPain: string = insights.contexto_tecnico?.main_pain ?? "N/A";
  const impactScore = insights.estrategista?.impact_score ?? "N/A";
  const executiveSummary = insights.estrategista?.executive_summary ?? "Sem resumo executivo.";
  const temperaturaLevel = insights.temperatura?.level ?? "low";
  const temperaturaSignals: string[] = insights.temperatura?.signals ?? [];
  const commitments: Commitment[] = insights.compromissos?.commitments ?? [];
  const clientPending = insights.validacao_entregas?.client_pending ?? [];
  const parecerGeral = insights.parecer_geral ?? "Nenhum parecer geral disponível.";

  const healthBgColor =
    healthStatus === "critical"
      ? "bg-error-container/20 border-error/20"
      : healthStatus === "warning"
      ? "bg-amber-100/20 border-amber-500/20"
      : "bg-secondary-container/20 border-secondary/20";

  return (
    <main className="max-w-[1440px] mx-auto p-12">
      {/* Page Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-outline text-sm mb-2">
          <Link
            href={`/dashboard/clientes/${clienteId}/projetos/${projetoId}`}
            className="font-medium hover:text-primary"
          >
            {project?.name || "Project"}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary font-medium">{meeting.title}</span>
        </div>
        <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">
          Meeting Insight Panel
        </h1>
      </div>

      {/* 3x3 Grid of AgentCells */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* 1. Perfilador */}
        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4 border-l-4 border-primary">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-headline font-bold text-lg">Perfilador</h2>
          </div>
          <div className="space-y-4">
            {participants.length === 0 && (
              <p className="text-sm text-on-surface-variant italic">Sem participantes registrados.</p>
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
                      {participant.archetype === "visionario"
                        ? "O Visionário"
                        : participant.archetype === "cetico"
                        ? "A Cética"
                        : participant.archetype === "executor"
                        ? "O Executor"
                        : "O Decisor"}{" "}
                      • Drive: {participant.driver ?? "N/A"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Advogado do Diabo */}
        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-error" />
            <h2 className="font-headline font-bold text-lg">Advogado do Diabo</h2>
          </div>
          <ul className="space-y-3">
            {risks.length === 0 && (
              <li className="text-sm text-on-surface-variant italic">Nenhum risco identificado.</li>
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

        {/* 3. Auditor de Entregas */}
        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-secondary" />
            <h2 className="font-headline font-bold text-lg">Auditor de Entregas</h2>
          </div>
          <div className="space-y-2">
            {deliveries.length === 0 && (
              <p className="text-sm text-on-surface-variant italic">Nenhuma entrega registrada.</p>
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

        {/* 4. Arquiteto */}
        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Network className="w-5 h-5 text-tertiary" />
            <h2 className="font-headline font-bold text-lg">Arquiteto</h2>
          </div>
          <div className="relative space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant">
            {automationFramework.length === 0 && (
              <p className="text-sm text-on-surface-variant italic pl-8">Sem framework de automação.</p>
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
                    {suggestion === "ia" ? "IA" : suggestion === "hibrido" ? "Híb" : "Hum"}
                  </div>
                  <div className="text-sm font-bold">{step.description}</div>
                  <p className="text-xs text-on-surface-variant">{step.rationale}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Estrategista */}
        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h2 className="font-headline font-bold text-lg">Estrategista</h2>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-headline font-black text-primary">
              {impactScore}
            </span>
            <span className="text-sm font-bold text-outline uppercase tracking-wider">
              Impacto Estratégico
            </span>
          </div>
          <div className="bg-primary-fixed/30 p-4 rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Resumo Executivo
            </h3>
            <p className="text-sm text-on-surface leading-relaxed">{executiveSummary}</p>
          </div>
          <Button
            variant="ghost"
            className="mt-auto flex items-center justify-between w-full p-3 bg-surface-container-highest rounded-lg text-sm font-bold hover:bg-surface-dim transition-colors group"
          >
            Ver e-mail de follow-up
            <ArrowRight className="w-4 h-4 text-outline group-hover:translate-x-1 transition-transform" />
          </Button>
        </section>

        {/* 6. Temperatura */}
        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-5 h-5 text-error" />
            <h2 className="font-headline font-bold text-lg">Temperatura</h2>
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
                ? "ALTA"
                : temperaturaLevel === "moderate"
                ? "MODERADA"
                : "BAIXA"}
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
                ? "Risco de Ruptura"
                : temperaturaLevel === "moderate"
                ? "Atenção Necessária"
                : "Estável"}
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

        {/* 7. Compromissos */}
        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-secondary" />
            <h2 className="font-headline font-bold text-lg">Compromissos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 text-outline text-[11px] uppercase tracking-widest font-bold">
                  <th className="pb-3 px-2">Quem</th>
                  <th className="pb-3 px-2">O Quê</th>
                  <th className="pb-3 px-2">Prazo</th>
                  <th className="pb-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {commitments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-on-surface-variant italic text-sm">
                      Nenhum compromisso registrado.
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
                  const statusLabels: Record<string, string> = {
                    defined: "Iniciado",
                    to_confirm: "Pendente",
                    delivered: "Em Dia",
                  };
                  return (
                    <tr key={idx}>
                      <td className="py-4 px-2 font-bold">{commitment.who}</td>
                      <td className="py-4 px-2">{commitment.what}</td>
                      <td className="py-4 px-2 text-outline-variant font-mono">
                        {commitment.deadline
                          ? new Date(commitment.deadline).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                            })
                          : "N/A"}
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

        {/* 8. Validação de Entregas */}
        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            <h2 className="font-headline font-bold text-lg">Validação de Entregas</h2>
          </div>
          <div className="space-y-4">
            <div className="text-[11px] font-bold text-outline-variant uppercase tracking-widest">
              Ações Pendentes do Cliente
            </div>
            {clientPending.length === 0 && (
              <p className="text-sm text-on-surface-variant italic">Nenhuma ação pendente.</p>
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
                    Responsável: {action.responsible}
                    {action.deadline &&
                      ` • Prazo: ${new Date(action.deadline).toLocaleDateString("pt-BR")}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 9. Contexto Técnico */}
        <section className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-4 lg:col-span-3">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-5 h-5 text-tertiary" />
            <h2 className="font-headline font-bold text-lg">Contexto Técnico</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-[11px] font-bold text-outline-variant uppercase tracking-widest mb-3">
                Stack em Discussão
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack.length === 0 && (
                  <span className="text-sm text-on-surface-variant italic">Nenhuma tech listada.</span>
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
                Principais Insumos
              </div>
              <ul className="space-y-2">
                {techInputs.length === 0 && (
                  <li className="text-sm text-on-surface-variant italic">Sem insumos registrados.</li>
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
                DOR PRINCIPAL ENFATIZADA
              </div>
              <div className="text-lg font-headline font-bold italic leading-tight">
                &ldquo;{mainPain}&rdquo;
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Parecer Geral Section */}
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
                {healthStatus === "critical"
                  ? "RISCO CRÍTICO"
                  : healthStatus === "warning"
                  ? "ATENÇÃO"
                  : "OK"}
              </div>
              <h2 className="text-3xl font-headline font-black text-on-surface tracking-tight">
                Parecer Geral
              </h2>
            </div>
            <p className="text-lg text-on-surface-variant max-w-4xl leading-relaxed">
              {parecerGeral}
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end">
            <div className="text-[11px] font-bold text-outline uppercase tracking-widest mb-2">
              Saúde do Projeto
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
