import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
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

const faviconUrl =
  "https://media.licdn.com/dms/image/v2/C4D0BAQGd8spbB1r3iQ/company-logo_200_200/company-logo_200_200/0/1663945501235/innovation_awards_latam_logo?e=1776902400&v=beta&t=0ZXd4Q5V2wI3W6ytnxSDc8EVTg76Ra5eeYUiMxkLs34";

export const metadata: Metadata = {
  title: "Fábrica de Inovação | Innovation Latam",
  description: "Plataforma de gestão de projetos de inovação - Innovation Hub Analytical Atelier",
  icons: {
    icon: faviconUrl,
    shortcut: faviconUrl,
    apple: faviconUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
