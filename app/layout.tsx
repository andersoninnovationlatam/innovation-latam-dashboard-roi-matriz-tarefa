import type { Metadata } from "next";
import Script from "next/script";
import { Manrope, Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/i18n/language-context";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const faviconUrl = "/favicon.png";

export const metadata: Metadata = {
  title: "Fábrica de Inovação | Innovation Latam",
  description: "Plataforma de gestão de projetos de inovação - Innovation Hub Analytical Atelier",
  icons: {
    icon: faviconUrl,
    shortcut: faviconUrl,
    apple: faviconUrl,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("il-lang")?.value === "en" ? "en" : "pt-BR";

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className={`${manrope.variable} ${inter.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
