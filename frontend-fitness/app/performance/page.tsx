import { redirect } from 'next/navigation';
import { TrendingUp, TrendingDown, Trophy, Activity, Flame, Dumbbell } from 'lucide-react';
import { auth } from '@/auth';
import { getDb } from '@/lib/mongodb';

// Simple SVG line chart
function LineChart({
  data, color, height = 120,
}: { data: { date: string; value: number }[]; color: string; height?: number }) {
  const w = 600, h = height, pad = 20;
  if (data.length < 2) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Pas assez de données
      </div>
    );
  }
  const vals = data.map(d => d.value);
  const min = Math.min(...vals) - 1;
  const max = Math.max(...vals) + 1;
  const xStep = (w - pad * 2) / (data.length - 1);
  const yScale = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);

  const pts = data.map((d, i) => `${pad + i * xStep},${yScale(d.value)}`).join(' ');
  const area = `M ${pad},${h - pad} ` + data.map((d, i) => `L ${pad + i * xStep},${yScale(d.value)}`).join(' ') + ` L ${pad + (data.length - 1) * xStep},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${color})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={pad + i * xStep} cy={yScale(d.value)} r="3.5" fill={color} />
      ))}
    </svg>
  );
}

function BarChart({ data }: { data: { label: string; value: number; max: number }[] }) {
  if (data.length === 0) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Aucune donnée récente</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(({ label, value, max }) => (
        <div key={label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{value} kcal</span>
          </div>
          <div className="progress-track" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function PerformancePage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const userId = (session.user as any).id;
  const db = await getDb();

  // Fetch données
  const sessionHistory = await db.collection("workoutSessions").find({ userId }).sort({ date: -1 }).toArray();
  const personalRecords = await db.collection("personalRecords").find({ userId }).sort({ date: -1 }).toArray();
  
  // Fake weight data initial pour la démo si vide
  let weightHistory = await db.collection("weightLogs").find({ userId }).sort({ date: 1 }).toArray();
  const profile = await db.collection("userProfiles").findOne({ userId });
  if (weightHistory.length === 0 && profile?.weight) {
    weightHistory = [{ date: profile.lastSessionDate || new Date().toISOString().split('T')[0], value: profile.weight, _id: 'fake' as any }];
  }

  // Calculs stats
  const totalSessions = sessionHistory.length;
  const totalCalories = sessionHistory.reduce((a, s) => a + (s.calories as number ?? 0), 0);
  const avgDuration   = totalSessions > 0 ? Math.round(sessionHistory.reduce((a, s) => a + (s.duration as number ?? 0), 0) / totalSessions) : 0;
  
  const weightDelta = weightHistory.length >= 2 
    ? (weightHistory[weightHistory.length - 1].weight as number ?? weightHistory[weightHistory.length - 1].value) - (weightHistory[0].weight as number ?? weightHistory[0].value) 
    : 0;

  const weeklyCalData = sessionHistory.slice(0, 7).map(s => ({
    label: new Date(s.date as string).toLocaleDateString('fr-FR', { weekday: 'short' }),
    value: s.calories as number,
    max: 400,
  }));

  const chartData = weightHistory.map((w: any) => ({
    date: w.date,
    value: w.weight ?? w.value
  }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📈 Performance & Statistiques</h1>
        <p className="page-subtitle">Visualisez votre progression sur {totalSessions} séances enregistrées.</p>
      </div>

      <div className="page-body">
        {/* KPI Row */}
        <div className="grid-4" style={{ gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Séances totales', value: totalSessions, unit: '', icon: Dumbbell, color: 'var(--primary)' },
            { label: 'Calories brûlées', value: totalCalories.toLocaleString('fr'), unit: 'kcal', icon: Flame, color: '#ef4444' },
            { label: 'Durée moyenne', value: avgDuration, unit: 'min', icon: Activity, color: 'var(--blue)' },
            { label: 'Évolution poids', value: weightDelta.toFixed(1), unit: 'kg', icon: weightDelta <= 0 ? TrendingDown : TrendingUp, color: weightDelta <= 0 ? 'var(--primary)' : '#ef4444' },
          ].map(({ label, value, unit, icon: Icon, color }) => (
            <div key={label} className="stat-card card-glow">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="stat-label">{label}</div>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} color={color} />
                </div>
              </div>
              <div className="stat-value" style={{ color }}>
                {value}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 3 }}>{unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Weight chart */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Évolution du poids</h2>
              <span className="badge badge-green">{weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg</span>
            </div>
            <LineChart data={chartData} color="var(--primary)" height={140} />
            {chartData.length >= 2 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
                <span>{chartData[0].date}</span>
                <span>{chartData[chartData.length - 1].date}</span>
              </div>
            )}
          </div>

          {/* Calories per session */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Calories brûlées (7 dernières séances)</h2>
            <BarChart data={weeklyCalData.reverse()} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Personal records */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={17} color="var(--gold)" /> Records personnels
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {personalRecords.length > 0 ? personalRecords.map((pr: any) => (
                <div key={pr.exerciseName} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 10,
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{pr.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{pr.exerciseName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{pr.date}</div>
                  </div>
                  <span className="badge badge-gold">{pr.value}</span>
                </div>
              )) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aucun record pour le moment.</div>
              )}
            </div>
          </div>

          {/* Session history */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Historique des séances</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
              {sessionHistory.length > 0 ? sessionHistory.map((s: any) => (
                <div key={s._id.toString()} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 10,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: s.mood >= 4 ? 'var(--primary)' : s.mood >= 3 ? 'var(--gold)' : '#ef4444',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{s.planName || 'Séance libre'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.date}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.78rem' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: 700 }}>{s.calories} kcal</div>
                    <div style={{ color: 'var(--text-muted)' }}>{s.duration} min</div>
                  </div>
                </div>
              )) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aucune séance enregistrée.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
