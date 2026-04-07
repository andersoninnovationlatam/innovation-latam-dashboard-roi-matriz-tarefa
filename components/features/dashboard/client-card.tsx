"use client";

import Link from "next/link";
import { HealthBadge } from "./health-badge";
import { Client, HealthStatus, Meeting } from "@/lib/types/domain";
import { cn } from "@/lib/utils";
import { FileText, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface ClientCardProps {
  client: Client;
  latestHealth: HealthStatus;
  latestMeeting: Meeting | null;
  parecerExcerpt: string;
  activeProjects?: number;
}

export function ClientCard({
  client,
  latestHealth,
  latestMeeting,
  parecerExcerpt,
  activeProjects = 0,
}: ClientCardProps) {
  const { lang, t } = useLanguage();
  const locale = lang === "pt" ? "pt-BR" : "en-US";

  const excerpt = parecerExcerpt
    ? parecerExcerpt.length > 120
      ? parecerExcerpt.substring(0, 120) + "..."
      : parecerExcerpt
    : t("client_card_no_parecer");

  const barColors = {
    ok: "bg-secondary",
    warning: "bg-amber-500",
    critical: "bg-error",
  };

  const lastMeetingDate = latestMeeting
    ? new Date(latestMeeting.meeting_date).toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : t("client_card_na");

  return (
    <Link href={`/dashboard/clientes/${client.id}`}>
      <article className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col relative group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 border border-outline-variant/10 h-full">
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-1.5",
            barColors[latestHealth]
          )}
        />
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-lg font-headline text-on-surface">
                {client.name}
              </h4>
              <span className="text-[10px] font-extrabold tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                {client.code}
              </span>
            </div>
            <HealthBadge status={latestHealth} />
          </div>
          <div className="bg-surface-container-low p-4 rounded-lg">
            <p className="text-xs font-bold text-on-surface-variant mb-2 flex items-center gap-1 uppercase tracking-wide">
              <FileText className="w-3 h-3" />
              {t("client_card_parecer_title")}
            </p>
            <p className="text-sm text-on-surface leading-relaxed italic">
              "{excerpt}"
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                {t("client_card_active_projects")}
              </span>
              <span className="text-lg font-bold text-on-surface">
                {activeProjects}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                {t("client_card_last_meeting")}
              </span>
              <span className="text-sm font-semibold text-on-surface">
                {lastMeetingDate}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-auto p-4 bg-surface-container-high/30 flex justify-between items-center border-t border-outline-variant/10">
          <span className="text-primary text-xs font-bold hover:underline">
            {t("client_card_view_profile")}
          </span>
          <ChevronRight className="text-on-surface-variant w-5 h-5" />
        </div>
      </article>
    </Link>
  );
}
