'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlanById } from '@/lib/data/plans';
import { ChevronLeft, Play, Pause, SkipForward, Check, X, Trophy } from 'lucide-react';

export default function SessionPage({ params }: { params: { id: string } }) {
  const plan = getPlanById(params.id);
  if (!plan) return notFound();

  const workDays = plan.weeklyPlan.filter(d => !d.isRest);
  const allExercises = workDays[0]?.exercises ?? [];

  const [phase, setPhase] = useState<'overview' | 'session' | 'done'>('overview');
  const [exIndex, setExIndex] = useState(0);
  const [setsDone, setSetsDone] = useState(0);
  const [restMode, setRestMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentEx = allExercises[exIndex];
  const totalSets = currentEx?.sets ?? 0;
  const restTime = currentEx?.rest ?? 60;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { setRunning(false); setRestMode(false); return 0; }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const handleSetDone = () => {
    const next = setsDone + 1;
    setCompletedSets(p => [...p, exIndex]);
    if (next >= totalSets) {
      // Next exercise
      if (exIndex + 1 >= allExercises.length) {
        setPhase('done');
      } else {
        setExIndex(i => i + 1);
        setSetsDone(0);
        setRestMode(true);
        setTimer(restTime);
        setRunning(true);
      }
    } else {
      setSetsDone(next);
      setRestMode(true);
      setTimer(restTime);
      setRunning(true);
    }
  };

  const skipRest = () => { setRunning(false); setRestMode(false); setTimer(0); };

  // ── Circumference for timer ring ──
  const r = 70, circ = 2 * Math.PI * r;
  const fillRatio = restTime > 0 ? timer / restTime : 0;
  const strokeDash = fillRatio * circ;

  if (phase === 'overview') {
    const todayDay = workDays[0];
    return (
      <div>
        <div className="page-header">
          <Link href="/entrainement" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: 16 }}>
            <ChevronLeft size={16} /> Retour aux plans
          </Link>
          <h1 className="page-title">{plan.name}</h1>
          <p className="page-subtitle">{plan.description}</p>
        </div>

        <div className="page-body">
          {/* Week plan */}
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Programme de la semaine</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {plan.weeklyPlan.map(day => (
                <div key={day.day} style={{
                  flex: '1 1 80px',
                  padding: '12px 8px', borderRadius: 12, textAlign: 'center',
                  background: day.isRest ? 'var(--bg-elevated)' : 'rgba(16,185,129,0.1)',
                  border: day.isRest ? '1px solid var(--border)' : '1px solid rgba(16,185,129,0.25)',
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 4, color: day.isRest ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {day.label}
                  </div>
                  {day.isRest ? (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Repos 😴</span>
                  ) : (
                    <>
                      <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>{day.focus}</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{day.exercises.length} exercices</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Today's exercises */}
          {todayDay && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Séance du jour — {todayDay.focus}</h2>
                <span className="badge badge-blue">{todayDay.exercises.length} exercices</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {todayDay.exercises.map((ex, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 12 }}>
                    <span style={{ fontSize: '1.6rem' }}>{ex.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ex.exerciseName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {ex.sets} séries × {ex.reps} · repos: {ex.rest}s
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>#{i + 1}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => setPhase('session')}>
                <Play size={18} /> Démarrer la séance
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40, maxWidth: 440 }} className="animate-bounce-in">
          <div style={{ fontSize: '5rem', marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 8 }}>Séance terminée !</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
            Félicitations ! Vous avez complété {allExercises.length} exercices. Votre streak continue !
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/performance" className="btn btn-primary">
              <Trophy size={16} /> Voir mes stats
            </Link>
            <Link href="/entrainement" className="btn btn-ghost">Retour aux plans</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── SESSION MODE ──
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Progress bar at top */}
      <div style={{ height: 4, background: 'var(--bg-elevated)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ height: '100%', background: 'var(--primary)', width: `${((exIndex) / allExercises.length) * 100}%`, transition: 'width 0.4s' }} />
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Exercice {exIndex + 1} / {allExercises.length}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPhase('overview')}>
            <X size={14} /> Arrêter
          </button>
        </div>

        {restMode ? (
          /* REST MODE */
          <div style={{ textAlign: 'center', padding: '40px 0' }} className="animate-fade-in">
            <div style={{ marginBottom: 16, color: 'var(--text-muted)', fontWeight: 600 }}>Temps de repos</div>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <svg width={160} height={160} viewBox="0 0 160 160">
                <circle cx={80} cy={80} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={10} />
                <circle
                  cx={80} cy={80} r={r} fill="none"
                  stroke="var(--primary)" strokeWidth={10} strokeLinecap="round"
                  strokeDasharray={`${strokeDash} ${circ}`}
                  transform="rotate(-90 80 80)"
                  style={{ transition: 'stroke-dasharray 1s linear' }}
                />
                <text x={80} y={88} textAnchor="middle" fill="var(--text-primary)" fontSize="28" fontWeight="800">{timer}s</text>
              </svg>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              Prochain : <strong>{allExercises[exIndex]?.exerciseName}</strong>
            </p>
            <button className="btn btn-ghost" onClick={skipRest}>
              <SkipForward size={15} /> Passer le repos
            </button>
          </div>
        ) : (
          /* EXERCISE MODE */
          <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: '5rem', marginBottom: 12 }}>{currentEx?.emoji}</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4 }}>{currentEx?.exerciseName}</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
                Série {setsDone + 1} sur {totalSets} · {currentEx?.reps} répétitions
              </div>

              {/* Sets progress */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
                {Array.from({ length: totalSets }).map((_, i) => (
                  <div key={i} style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: i < setsDone ? 'var(--primary)' : i === setsDone ? 'var(--primary-glow)' : 'var(--bg-elevated)',
                    border: i === setsDone ? '2px solid var(--primary)' : '2px solid transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: i < setsDone ? '#000' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: '0.82rem',
                    transition: 'all 0.3s',
                  }}>
                    {i < setsDone ? <Check size={16} /> : i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* All exercises mini list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
              {allExercises.map((ex, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10,
                  background: i === exIndex ? 'var(--primary-glow)' : i < exIndex ? 'rgba(16,185,129,0.05)' : 'var(--bg-elevated)',
                  border: i === exIndex ? '1px solid rgba(16,185,129,0.35)' : '1px solid transparent',
                  opacity: i > exIndex ? 0.5 : 1,
                }}>
                  {i < exIndex ? <Check size={14} color="var(--primary)" /> : <span style={{ fontSize: '1rem' }}>{ex.emoji}</span>}
                  <span style={{ fontSize: '0.82rem', fontWeight: i === exIndex ? 700 : 400, flex: 1, color: i === exIndex ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    {ex.exerciseName}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ex.sets}×{ex.reps}</span>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={handleSetDone}
            >
              <Check size={18} />
              {setsDone + 1 === totalSets && exIndex + 1 === allExercises.length
                ? 'Terminer la séance !'
                : `Série ${setsDone + 1} terminée ✓`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
