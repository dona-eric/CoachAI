'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Dumbbell, BookOpen, Apple, TrendingUp } from 'lucide-react';

const items = [
  { href: '/dashboard',    label: 'Accueil',   icon: LayoutDashboard },
  { href: '/entrainement', label: 'Training',  icon: Dumbbell },
  { href: '/exercices',    label: 'Exercices', icon: BookOpen },
  { href: '/nutrition',    label: 'Nutrition', icon: Apple },
  { href: '/performance',  label: 'Stats',     icon: TrendingUp },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Masque sur les pages auth et la landing
  if (pathname.startsWith('/auth') || pathname === '/') return null;

  return (
    <nav style={{
      display: 'none',
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: 'rgba(15,17,23,0.94)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      zIndex: 150,
      paddingBottom: 'env(safe-area-inset-bottom, 8px)',
    }}
    className="bottom-nav-mobile"
    >
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 0 4px' }}>
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '4px 10px',
                textDecoration: 'none',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'color 0.15s',
                minWidth: 56,
              }}
            >
              <div style={{
                width: 38, height: 32, borderRadius: 9,
                background: active ? 'rgba(16,185,129,0.15)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}>
                <Icon size={19} />
              </div>
              <span style={{ fontSize: '0.6rem', fontWeight: active ? 700 : 500, letterSpacing: '0.02em' }}>{label}</span>
            </Link>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bottom-nav-mobile { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
