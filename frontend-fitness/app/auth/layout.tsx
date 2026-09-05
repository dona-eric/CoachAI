import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KINETIC — Connexion",
};

// Layout minimal pour les pages auth — pas de sidebar, pas de bottomnav
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
