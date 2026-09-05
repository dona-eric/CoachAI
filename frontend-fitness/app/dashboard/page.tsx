'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Flame, Dumbbell, Calendar, TrendingUp, Apple, Target, ChevronRight, Zap, BookOpen } from 'lucide-react';
import { trainingPlans } from '@/lib/data/plans'; // On garde les plans en local pour l'instant, c'est du catalogue

const fadeUp = (delay = 0) => ({
  initial:  { opacity: 0, y: 20 },
  animate:  { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45, ease: 'easeOut' as const },
});

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return { text: 'Bonne nuit',      emoji: '🌙' };
  if (h < 12) return { text: 'Bonjour',          emoji: '☀️' };
  if (h < 18) return { text: 'Bon après-midi',   emoji: '⚡' };
  return             { text: 'Bonsoir',           emoji: '🌆' };
}

function WeeklyHeatmap({ sessions }: { sessions: any[] }) {
  const today = new Date();
  const days: { date: string; has: boolean }[] = [];
  for (let i = 55; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    days.push({ date: ds, has: sessions.some(s => s.date === ds) });
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, maxWidth: 300 }}>
      {days.map(({ date, has }, i) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.005 }}
          title={date}
          style={{
            width: 10, height: 10, borderRadius: 2,
            background: has ? 'var(--primary)' : 'var(--bg-elevated)',
          }}
        />
      ))}
    </div>
  );
}

function ActivityRing({ value, max, color, size = 80, label }: {
  value: number; max: number; color: string; size?: number; label: string;
}) {
  const r    = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(value / max, 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <motion.svg
        width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: -90, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={8} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={8} strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${pct * circ} ${circ}` }}
          transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
        />
        <text x={size/2} y={size/2 + 1} textAnchor="middle" fill={color} fontSize="11" fontWeight="800"
          transform={`rotate(90, ${size/2}, ${size/2})`}>
          {Math.round(pct * 100)}%
        </text>
      </motion.svg>
      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { text: greeting, emoji } = getGreeting();

  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/workouts/stats').then(res => res.json()),
      fetch('/api/user/profile').then(res => res.json())
    ]).then(([statsData, profileData]) => {
      // Vérifier si l'utilisateur a complété l'onboarding
      if (profileData?.error || !profileData?.onboardingDone) {
        router.push('/onboarding');
      } else {
        setStats(statsData);
        setProfile(profileData);
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width={24} height={24} viewBox="0 0 16 16" style={{ animation: 'spin 0.8s linear infinite' }}>
            <circle cx={8} cy={8} r={6} fill="none" stroke="var(--primary)" strokeWidth={2} strokeDasharray="28 8" />
          </svg>
          <span style={{ color: 'var(--text-secondary)' }}>Chargement des données...</span>
        </div>
      </div>
    );
  }

  const userName   = session?.user?.name?.split(' ')[0] ?? profile?.name?.split(' ')[0] ?? 'Athlète';
  const activePlan = trainingPlans.find(p => p.id === profile?.activePlanId) ?? trainingPlans[0];
  const todayDay   = activePlan?.weeklyPlan.find(d => !d.isRest);
  
  const lastSession = stats?.recentSessions?.[0] ?? null;
  const sessionHistory = stats?.recentSessions ?? [];

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header" style={{ paddingBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <motion.div {...fadeUp(0)}>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              {emoji} {greeting},
            </div>
            <h1 className="page-title">{userName} 👋</h1>
            <p className="page-subtitle">Voici votre résumé du jour</p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.span
              animate={{ scale: [1, 1.15, 1], rotate: [-3, 3, -3] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '1.5rem', display: 'inline-block' }}
            >🔥</motion.span>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>{stats?.streak ?? 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>jours d&apos;affilée</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ── Stats ── */}
        <div className="grid-4" style={{ gap: 12 }}>
          {[
            { label: 'Séances totales',        value: stats?.totalSessions ?? 0, unit: '',       icon: Dumbbell,    color: 'var(--primary)', trend: 'depuis l\'inscription' },
            { label: 'Calories (semaine)',      value: stats?.weekCalories ?? 0,  unit: 'kcal',  icon: Flame,       color: '#ef4444',        trend: 'cette semaine' },
            { label: 'Séances / semaine',       value: activePlan?.sessionsPerWeek ?? 0, unit: '',  icon: Calendar, color: 'var(--blue)',    trend: activePlan?.name ?? '' },
            { label: 'Poids perdu',             value: '0',                       unit: 'kg',    icon: TrendingUp,  color: 'var(--gold)',     trend: 'depuis début' },
          ].map(({ label, value, unit, icon: Icon, color, trend }, i) => (
            <motion.div key={label} {...fadeUp(0.05 + i * 0.06)} className="stat-card card-glow">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-label">{label}</div>
                  <div className="stat-value" style={{ color, marginTop: 6 }}>
                    {value}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 3 }}>{unit}</span>
                  </div>
                </div>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color={color} />
                </div>
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 4 }}>{trend}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Main row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Today's session */}
          <motion.div {...fadeUp(0.25)} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Séance du jour</h2>
                {activePlan && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{activePlan.name}</div>}
              </div>
              <Link href={`/entrainement/${activePlan?.id}`} className="btn btn-primary btn-sm">
                <Zap size={13} /> Démarrer
              </Link>
            </div>

            {todayDay && !todayDay.isRest ? (
              <div>
                <span className="badge badge-blue" style={{ marginBottom: 16, display: 'inline-flex' }}>{todayDay.focus}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {todayDay.exercises.map((ex: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.07 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '11px 14px',
                        background: 'var(--bg-elevated)',
                        borderRadius: 10,
                      }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>{ex.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{ex.exerciseName}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                          {ex.sets} séries × {ex.reps} · repos {ex.rest}s
                        </div>
                      </div>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--border)', flexShrink: 0 }} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>😴</div>
                <div style={{ fontWeight: 600 }}>Jour de repos</div>
                <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Profitez-en pour récupérer !</div>
              </div>
            )}
          </motion.div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Rings */}
            <motion.div {...fadeUp(0.3)} className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 18 }}>Dernière séance</h3>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <ActivityRing value={lastSession?.calories ?? 0} max={400}  color="#ef4444"        label="Calories" />
                <ActivityRing value={lastSession?.exercisesDone ?? 0} max={6} color="var(--primary)" label="Exercices" />
                <ActivityRing value={1800} max={2500} color="var(--blue)" label="Eau (ml)" />
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div {...fadeUp(0.35)} className="card" style={{ padding: 14 }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 10 }}>Accès rapide</h3>
              {[
                { href: '/exercices',    label: 'Exercices',     emoji: '📚' },
                { href: '/nutrition',    label: 'Journal repas', emoji: '🥗' },
                { href: '/performance',  label: 'Mes stats',     emoji: '📈' },
                { href: '/recuperation', label: 'Récupération',  emoji: '💆' },
              ].map(({ href, label, emoji: e }) => (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 0', borderBottom: '1px solid var(--border)',
                  textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.83rem',
                }}>
                  <span>{e} {label}</span>
                  <ChevronRight size={13} />
                </Link>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Heatmap ── */}
        <motion.div {...fadeUp(0.45)} className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Activité — 8 dernières semaines</h3>
            <span className="badge badge-green">{stats?.totalSessions ?? 0} séances</span>
          </div>
          <WeeklyHeatmap sessions={sessionHistory} />
          <div style={{ display: 'flex', gap: 10, marginTop: 10, fontSize: '0.7rem', color: 'var(--text-muted)', alignItems: 'center' }}>
            <span>Moins</span>
            {[0.2, 0.4, 0.6, 0.8, 1].map(o => (
              <div key={o} style={{ width: 10, height: 10, borderRadius: 2, background: `rgba(16,185,129,${o})` }} />
            ))}
            <span>Plus</span>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
