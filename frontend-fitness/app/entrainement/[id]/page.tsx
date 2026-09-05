'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlanById } from '@/lib/data/plans';
import { ChevronLeft, Play, Pause, SkipForward, Check, X, Trophy, Flame, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

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
  
  // Tracking
  const [weight, setWeight] = useState(70);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentEx = allExercises[exIndex];
  const totalSets = currentEx?.sets ?? 0;
  const restTime = currentEx?.rest ?? 60;

  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()).then(data => {
      if (data.weight) setWeight(data.weight);
    });
  }, []);

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

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#10b981', '#3b82f6', '#f59e0b'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#10b981', '#3b82f6', '#f59e0b'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const startSession = () => {
    setStartTime(Date.now());
    setPhase('session');
  };

  const handleSetDone = () => {
    const next = setsDone + 1;
    if (next >= totalSets) {
      if (exIndex + 1 >= allExercises.length) {
        // Séance terminée
        const end = Date.now();
        const durationMin = Math.max(1, Math.round((end - (startTime || end)) / 60000));
        const cals = Math.round(6.0 * weight * (durationMin / 60)); // MET de 6.0 en moyenne
        
        setSessionDuration(durationMin);
        setCaloriesBurned(cals);
        setPhase('done');
        triggerConfetti();

        // Sauvegarder en DB
        fetch('/api/workouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            planId: plan.id,
            planName: plan.name,
            duration: durationMin,
            calories: cals,
            exercisesDone: allExercises.length,
            totalSets: allExercises.reduce((acc, ex) => acc + ex.sets, 0),
            mood: 4,
            notes: "Séance complétée via mode direct."
          })
        }).catch(err => console.error("Failed to save workout", err));

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

  // ── Animation Variants ──
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const r = 70, circ = 2 * Math.PI * r;
  const fillRatio = restTime > 0 ? timer / restTime : 0;
  const strokeDash = fillRatio * circ;

  if (phase === 'overview') {
    const todayDay = workDays[0];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="page-header">
          <Link href="/entrainement" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: 16 }}>
            <ChevronLeft size={16} /> Retour aux plans
          </Link>
          <h1 className="page-title">{plan.name}</h1>
          <p className="page-subtitle">{plan.description}</p>
        </div>

        <div className="page-body">
          {todayDay && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>Aujourd&apos;hui — {todayDay.focus}</h2>
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
                  </div>
                ))}
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary btn-lg" 
                style={{ width: '100%', fontSize: '1.1rem' }} 
                onClick={startSession}
              >
                <Play size={20} fill="#000" /> Démarrer la séance
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (phase === 'done') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ type: 'spring', bounce: 0.4 }}
        style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ textAlign: 'center', padding: 40, maxWidth: 440 }}>
          <div style={{ fontSize: '5rem', marginBottom: 10 }}>🔥</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.03em' }}>Séance terminée !</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem', lineHeight: 1.6 }}>
            Excellent travail. La séance a été enregistrée dans votre historique.
          </p>

          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 40 }}>
            <div style={{ background: 'var(--bg-elevated)', padding: '16px 24px', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8, justifyContent: 'center' }}>
                <Clock size={16} /> Temps
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{sessionDuration} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>min</span></div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '16px 24px', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8, justifyContent: 'center' }}>
                <Flame size={16} color="#ef4444" /> Calories
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{caloriesBurned} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kcal</span></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexDirection: 'column' }}>
            <Link href="/performance" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              <Trophy size={18} /> Voir mes statistiques
            </Link>
            <Link href="/dashboard" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── SESSION MODE ──
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Progress bar at top */}
      <div style={{ height: 6, background: 'var(--bg-elevated)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ height: '100%', background: 'var(--primary)', width: `${((exIndex + setsDone/totalSets) / allExercises.length) * 100}%`, transition: 'width 0.5s ease-out' }} />
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Exercice {exIndex + 1} / {allExercises.length}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPhase('overview')}>
            <X size={16} /> Quitter
          </button>
        </div>

        <AnimatePresence mode="wait">
          {restMode ? (
            /* REST MODE */
            <motion.div 
              key="rest"
              variants={pageVariants} initial="initial" animate="animate" exit="exit"
              style={{ textAlign: 'center', padding: '40px 0' }}
            >
              <div style={{ marginBottom: 24, color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 700 }}>Repos</div>
              
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                <svg width={180} height={180} viewBox="0 0 160 160">
                  <circle cx={80} cy={80} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={8} />
                  <circle
                    cx={80} cy={80} r={r} fill="none"
                    stroke="var(--primary)" strokeWidth={8} strokeLinecap="round"
                    strokeDasharray={`${strokeDash} ${circ}`}
                    transform="rotate(-90 80 80)"
                    style={{ transition: 'stroke-dasharray 1s linear' }}
                  />
                  <text x={80} y={88} textAnchor="middle" fill="var(--text-primary)" fontSize="32" fontWeight="900">{timer}s</text>
                </svg>
              </div>

              <div style={{ background: 'var(--bg-elevated)', padding: 20, borderRadius: 16, marginBottom: 24 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>Prochain exercice</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{allExercises[exIndex]?.exerciseName}</div>
              </div>

              <button className="btn btn-ghost" onClick={skipRest} style={{ width: '100%', justifyContent: 'center' }}>
                <SkipForward size={18} /> Passer le repos
              </button>
            </motion.div>
          ) : (
            /* EXERCISE MODE */
            <motion.div 
              key={`ex-${exIndex}`}
              variants={pageVariants} initial="initial" animate="animate" exit="exit"
            >
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  transition={{ type: 'spring' }}
                  style={{ fontSize: '6rem', marginBottom: 16 }}
                >
                  {currentEx?.emoji}
                </motion.div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>
                  {currentEx?.exerciseName}
                </h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: 24 }}>
                  <strong>{currentEx?.reps} répétitions</strong>
                </div>

                {/* Sets progress */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 40 }}>
                  {Array.from({ length: totalSets }).map((_, i) => (
                    <motion.div 
                      key={i} 
                      animate={i === setsDone ? { scale: [1, 1.1, 1] } : {}}
                      transition={i === setsDone ? { repeat: Infinity, duration: 2 } : {}}
                      style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: i < setsDone ? 'var(--primary)' : i === setsDone ? 'rgba(16,185,129,0.1)' : 'var(--bg-elevated)',
                        border: i === setsDone ? '2px solid var(--primary)' : i < setsDone ? '2px solid var(--primary)' : '2px solid transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: i < setsDone ? '#000' : 'var(--text-primary)',
                        fontWeight: 800, fontSize: '1rem',
                        transition: 'all 0.3s',
                      }}
                    >
                      {i < setsDone ? <Check size={20} strokeWidth={3} /> : i + 1}
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', fontSize: '1.2rem', padding: '20px' }}
                onClick={handleSetDone}
              >
                <Check size={22} strokeWidth={3} />
                {setsDone + 1 === totalSets && exIndex + 1 === allExercises.length
                  ? 'Terminer l\'entraînement !'
                  : `Série ${setsDone + 1} terminée`}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
