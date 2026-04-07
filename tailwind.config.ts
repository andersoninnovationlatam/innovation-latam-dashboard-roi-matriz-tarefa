import type { Config } from "tailwindcss";

/**
 * Tokens alinhados a `app/globals.css` (Material 3 + compat shadcn).
 * Usamos `var(--*)` direto porque as variáveis estão em hex, não em canais HSL.
 */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--outline-variant)",
        input: "var(--outline-variant)",
        ring: "var(--primary)",
        background: "var(--background)",
        foreground: "var(--on-surface)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--on-primary)",
          container: "var(--primary-container)",
          fixed: "var(--primary-fixed)",
          "fixed-dim": "var(--primary-fixed-dim)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--on-secondary)",
          container: "var(--secondary-container)",
          fixed: "var(--secondary-fixed)",
          "fixed-dim": "var(--secondary-fixed-dim)",
        },
        tertiary: {
          DEFAULT: "var(--tertiary)",
          container: "var(--tertiary-container)",
          fixed: "var(--tertiary-fixed)",
          "fixed-dim": "var(--tertiary-fixed-dim)",
        },
        error: {
          DEFAULT: "var(--error)",
          container: "var(--error-container)",
        },
        muted: {
          DEFAULT: "var(--surface-container-high)",
          foreground: "var(--on-surface-variant)",
        },
        accent: {
          DEFAULT: "var(--surface-container-low)",
          foreground: "var(--on-surface)",
        },
        destructive: {
          DEFAULT: "var(--error)",
          foreground: "var(--on-error)",
        },
        card: {
          DEFAULT: "var(--surface-container-lowest)",
          foreground: "var(--on-surface)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          dim: "var(--surface-dim)",
          bright: "var(--surface-bright)",
          variant: "var(--surface-variant)",
          tint: "var(--surface-tint)",
          container: {
            DEFAULT: "var(--surface-container)",
            low: "var(--surface-container-low)",
            lowest: "var(--surface-container-lowest)",
            high: "var(--surface-container-high)",
            highest: "var(--surface-container-highest)",
          },
        },
        on: {
          surface: {
            DEFAULT: "var(--on-surface)",
            variant: "var(--on-surface-variant)",
          },
          primary: {
            DEFAULT: "var(--on-primary)",
            container: "var(--on-primary-container)",
            fixed: "var(--on-primary-fixed)",
            "fixed-variant": "var(--on-primary-fixed-variant)",
          },
          secondary: {
            DEFAULT: "var(--on-secondary)",
            container: "var(--on-secondary-container)",
            fixed: "var(--on-secondary-fixed)",
            "fixed-variant": "var(--on-secondary-fixed-variant)",
          },
          tertiary: {
            DEFAULT: "var(--on-tertiary)",
            container: "var(--on-tertiary-container)",
            fixed: "var(--on-tertiary-fixed)",
            "fixed-variant": "var(--on-tertiary-fixed-variant)",
          },
          error: {
            DEFAULT: "var(--on-error)",
            container: "var(--on-error-container)",
          },
          background: "var(--on-background)",
        },
        outline: {
          DEFAULT: "var(--outline)",
          variant: "var(--outline-variant)",
        },
        inverse: {
          primary: "var(--inverse-primary)",
          onSurface: "var(--inverse-on-surface)",
          surface: "var(--inverse-surface)",
        },
      },
      fontFamily: {
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        headline: ["var(--font-manrope)", "Manrope", "sans-serif"],
        label: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
