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
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
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
