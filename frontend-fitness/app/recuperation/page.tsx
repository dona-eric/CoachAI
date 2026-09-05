'use client';
import { useState, useEffect } from 'react';
import { Moon, AlertTriangle, Heart, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const stretches = [
  { name: 'Étirement des ischio-jambiers', emoji: '🦵', duration: '30 sec / jambe', muscles: 'Ischio-jambiers, mollets' },
  { name: 'Pigeon (hanche)', emoji: '🕊️', duration: '45 sec / côté', muscles: 'Fléchisseurs de hanche, fessiers' },
  { name: 'Chat-Vache (dos)', emoji: '🐱', duration: '10 respirations', muscles: 'Colonne vertébrale, lombaires' },
  { name: 'Enfant (Child pose)', emoji: '🧘', duration: '60 sec', muscles: 'Dos, épaules, hanches' },
  { name: 'Rotations cervicales', emoji: '🌀', duration: '10 x chaque sens', muscles: 'Cou, trapèzes' },
  { name: 'Étirement du quadriceps', emoji: '🏃', duration: '30 sec / jambe', muscles: 'Quadriceps, genou' },
];

const warnings = [
  { text: 'Plus de 6 séances cette semaine — risque de surentraînement', type: 'danger' },
  { text: 'Douleur persistante ? Prenez 1-2 jours de repos complet', type: 'warning' },
  { text: 'Baisse de motivation : normal après 3 semaines, continuez !', type: 'info' },
];

const sleepTips = [
  'Dormez 7-9h pour une récupération musculaire optimale',
  'Évitez les écrans 1h avant le coucher',
  'La mélatonine naturelle : chambre sombre et fraîche (18-20°C)',
  'Un repas léger 2h avant le sommeil favorise la récupération',
];

function RecoveryScore({ value }: { value: number }) {
  const color = value >= 70 ? 'var(--primary)' : value >= 40 ? 'var(--gold)' : '#ef4444';
  const r = 54, circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ * 0.75; // 3/4 arc
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={140} height={120} viewBox="0 0 140 120">
        {/* Background arc */}
        <path
          d={`M ${70 - r * Math.cos(Math.PI * 0.75)} ${70 + r * Math.sin(Math.PI * 0.75)} A ${r} ${r} 0 1 1 ${70 + r * Math.cos(Math.PI * 0.75)} ${70 + r * Math.sin(Math.PI * 0.75)}`}
          fill="none" stroke="var(--bg-elevated)" strokeWidth={12} strokeLinecap="round"
        />
        <circle cx={70} cy={70} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={12}
          strokeDasharray={`${circ * 0.75} ${circ}`}
          strokeDashoffset={-circ * 0.125}
          transform="rotate(135 70 70)"
        />
        <circle cx={70} cy={70} r={r} fill="none" stroke={color} strokeWidth={12}
          strokeDasharray={`${fill} ${circ}`}
          strokeDashoffset={-circ * 0.125}
          strokeLinecap="round"
          transform="rotate(135 70 70)"
        />
        <text x={70} y={68} textAnchor="middle" fill={color} fontSize="28" fontWeight="900">{value}</text>
        <text x={70} y={84} textAnchor="middle" fill="var(--text-muted)" fontSize="10">/100</text>
      </svg>
      <span style={{
        fontSize: '0.9rem', fontWeight: 700,
        color: value >= 70 ? 'var(--primary)' : value >= 40 ? 'var(--gold)' : '#ef4444',
      }}>
        {value >= 70 ? '✅ Récupération bonne' : value >= 40 ? '⚠️ Récupération partielle' : '🔴 Repos nécessaire'}
      </span>
    </div>
  );
}

export default function RecuperationPage() {
  const [sleep, setSleep] = useState(7.5);
  const [openStretch, setOpenStretch] = useState<number | null>(null);
  const [last7sessions, setLast7sessions] = useState(0);

  useEffect(() => {
    fetch('/api/workouts/stats').then(res => res.json()).then(data => {
      if (data.recentSessions) {
        const count = data.recentSessions.filter((s: any) => {
          const d = new Date(s.date);
          const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
          return diff <= 7;
        }).length;
        setLast7sessions(count);
      }
    });
  }, []);

  // Simple score calc: based on last 7 days activity + sleep
  const recoveryScore = Math.round(Math.max(0, Math.min(100,
    60 + (sleep - 6) * 10 - last7sessions * 5
  )));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💆 Récupération & Prévention</h1>
        <p className="page-subtitle">Optimisez votre récupération pour des progrès durables.</p>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Recovery score */}
          <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Score de récupération du jour</h2>
            <RecoveryScore value={recoveryScore} />
            <div style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 10, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Basé sur : {last7sessions} séances / 7 jours · {sleep}h de sommeil · charge hebdomadaire
            </div>
          </div>

          {/* Sleep tracker */}
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Moon size={16} color="var(--blue)" /> Suivi du sommeil
            </h2>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className="label">Heures de sommeil cette nuit</label>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: sleep >= 7 ? 'var(--primary)' : 'var(--gold)' }}>{sleep}h</span>
              </div>
              <input
                type="range" min={4} max={12} step={0.5} value={sleep}
                onChange={e => setSleep(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>4h (insuffisant)</span><span>8h (idéal)</span><span>12h (excessif)</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sleepTips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle size={14} color="var(--blue)" style={{ flexShrink: 0, marginTop: 2 }} />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stretching plan */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Heart size={16} color="#ef4444" /> Plan d&apos;étirements du jour
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stretches.map((s, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenStretch(openStretch === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 10,
                    border: openStretch === i ? '1px solid rgba(16,185,129,0.35)' : '1px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{s.emoji}</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{s.name}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{s.duration}</div>
                  </div>
                  {openStretch === i ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                </button>
                {openStretch === i && (
                  <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.05)', borderRadius: '0 0 10px 10px', border: '1px solid rgba(16,185,129,0.15)', borderTop: 'none' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <strong>Muscles ciblés :</strong> {s.muscles}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Overtraining warnings */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="var(--gold)" /> Signaux d&apos;alerte
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {warnings.map((w, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 10,
                background: w.type === 'danger' ? 'rgba(239,68,68,0.08)' : w.type === 'warning' ? 'rgba(245,158,11,0.08)' : 'rgba(59,130,246,0.08)',
                border: `1px solid ${w.type === 'danger' ? 'rgba(239,68,68,0.25)' : w.type === 'warning' ? 'rgba(245,158,11,0.25)' : 'rgba(59,130,246,0.25)'}`,
              }}>
                <AlertTriangle size={15} color={w.type === 'danger' ? '#ef4444' : w.type === 'warning' ? 'var(--gold)' : 'var(--blue)'} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{w.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
