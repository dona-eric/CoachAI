import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "KINETIC METHOD - The science of gymnastic strength",
  description: "Master your movement. Des plans d'entraînement personnalisés pour développer force, contrôle et mobilité.",
  keywords: ["KINETIC METHOD", "gymnastic strength", "calisthenics", "fitness", "entraînement", "movement"],
  openGraph: {
    title: "KINETIC METHOD - The science of gymnastic strength",
    description: "Master your movement.",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="fr">
      <body>
        <SessionProvider session={session}>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
