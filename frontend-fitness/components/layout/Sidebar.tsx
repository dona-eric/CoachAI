'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard, Dumbbell, BookOpen, Apple,
  TrendingUp, Heart, User, Zap, LogOut, MessageSquare
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',    label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/entrainement', label: 'Entraînement',    icon: Dumbbell },
  { href: '/exercices',    label: 'Exercices',        icon: BookOpen },
  { href: '/nutrition',    label: 'Nutrition',        icon: Apple },
  { href: '/performance',  label: 'Performance',      icon: TrendingUp },
  { href: '/recuperation', label: 'Récupération',     icon: Heart },
  { href: '/coaching',     label: 'Coach IA',         icon: MessageSquare },
  { href: '/profil',       label: 'Mon Profil',       icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Cache la sidebar sur les pages auth
  if (pathname.startsWith('/auth')) return null;

  const userName  = session?.user?.name  ?? 'Athlete';
  const userEmail = session?.user?.email ?? '';
  const initials  = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      zIndex: 100,
      overflowY: 'auto',
    }}>
      {/* ── Logo ── */}
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #065f46, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(16,185,129,0.35)',
            flexShrink: 0,
          }}>
            <Zap size={17} color="#000" fill="#000" />
          </div>
          <div>
            <div style={{
              fontWeight: 900, fontSize: '1.05rem',
              color: 'var(--text-primary)', letterSpacing: '-0.03em',
            }}>KINETIC</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Fitness Platform
            </div>
          </div>
        </Link>
      </div>

      {/* ── Nav ── */}
      <nav style={{ padding: '10px 8px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', padding: '8px 10px 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Navigation
        </div>

        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 9,
                margin: '1px 0',
                textDecoration: 'none',
                fontWeight: active ? 600 : 500,
                fontSize: '0.86rem',
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
                background: active ? 'rgba(16,185,129,0.1)' : 'transparent',
                borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ── User + Logout ── */}
      <div style={{
        padding: '12px 12px 14px',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.82rem', fontWeight: 800, color: '#000',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </div>
            <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userEmail}
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px',
            borderRadius: 8, border: '1px solid var(--border)',
            background: 'transparent', cursor: 'pointer',
            fontSize: '0.8rem', color: 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
            (e.currentTarget as HTMLElement).style.color = '#ef4444';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.25)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
          }}
        >
          <LogOut size={14} />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
