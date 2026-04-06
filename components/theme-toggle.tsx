"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        className="p-3 rounded-full bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
        aria-label="Alternar tema"
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      className="p-3 rounded-full bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
      aria-label="Alternar tema"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
