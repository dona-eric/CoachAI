import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "KINETIC — Votre Coach Fitness Personnel",
  description: "Plateforme de fitness complète : plans d'entraînement personnalisés, suivi des performances, nutrition et coaching IA. Entraînez-vous n'importe où, avec ou sans équipement.",
  keywords: ["fitness", "coach", "entraînement", "nutrition", "bodyweight", "sport", "KINETIC"],
  openGraph: {
    title: "KINETIC — Coaching Fitness IA",
    description: "Transformez votre corps avec KINETIC.",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <SessionProvider session={session}>
          <div className="app-shell">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
            <BottomNav />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
