"use client";

import { Search, Bell, HelpCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/lib/i18n/language-context";

interface TopAppBarProps {
  userEmail?: string;
  userName?: string;
}

export function TopAppBar({ userEmail, userName }: TopAppBarProps) {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="fixed top-0 w-full z-40 bg-surface-container-lowest/70 backdrop-blur-xl shadow-sm h-16 border-b border-outline-variant/20">
      <div className="flex items-center justify-between px-8 h-full w-full max-w-[1920px] mx-auto pl-72">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-primary font-headline">
            Fábrica de Inovação
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
            <input
              className="bg-surface-container-highest border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface placeholder:text-outline"
              placeholder={t("topbar_search_placeholder")}
              type="text"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 active:scale-95">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 active:scale-95">
              <HelpCircle className="w-5 h-5" />
            </button>
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "pt" ? "en" : "pt")}
              className="px-2.5 py-1 rounded-full border border-outline-variant/40 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
              title={lang === "pt" ? "Switch to English" : "Mudar para Português"}
            >
              {lang === "pt" ? "EN" : "PT"}
            </button>
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30 flex items-center justify-center">
              <span className="text-xs font-semibold text-on-surface">
                {userName
                  ? userName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : userEmail?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
