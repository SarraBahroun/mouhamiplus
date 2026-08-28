import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/providers/LangProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { AppDataProvider } from "@/providers/AppDataProvider";
import { SessionProvider } from "@/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Mouhami+",
  description: "La plateforme juridique de confiance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // `lang`/`dir` doivent refléter DEFAULT_LANG (LangProvider) : c'est le rendu servi
  // avant que le provider n'applique la langue mémorisée du visiteur. Un `ar`/`rtl`
  // figé ici provoquait un flash de mise en page inversée au premier chargement.
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <body>
        <LangProvider>
          <ToastProvider>
            <AppDataProvider>
              <SessionProvider>{children}</SessionProvider>
            </AppDataProvider>
          </ToastProvider>
        </LangProvider>
      </body>
    </html>
  );
}
