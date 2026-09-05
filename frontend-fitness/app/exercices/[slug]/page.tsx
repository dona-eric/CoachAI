import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getExerciseBySlug } from '@/lib/data/exercises';
import { ChevronLeft, CheckCircle, AlertTriangle, Shuffle, Flame } from 'lucide-react';

export default async function ExerciceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const ex = getExerciseBySlug(resolvedParams.slug);
  if (!ex) return notFound();

  const levelLabel: Record<string, string> = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' };
  const levelColor: Record<string, string> = { debutant: 'badge-green', intermediaire: 'badge-gold', avance: 'badge-red' };
  const catLabel: Record<string, string> = { force: 'Force', cardio: 'Cardio', core: 'Core / Gainage', mobilite: 'Mobilité' };

  return (
    <div>
      <div className="page-header">
        <Link href="/exercices" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: 16 }}>
          <ChevronLeft size={16} /> Retour aux exercices
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          {/* Big emoji */}
          <div style={{
            width: 80, height: 80, borderRadius: 20, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem',
            border: '1px solid var(--border)',
          }}>
            {ex.emoji}
          </div>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span className={`badge ${levelColor[ex.level]}`}>{levelLabel[ex.level]}</span>
              <span className="badge badge-blue">{catLabel[ex.category]}</span>
              <span className="badge badge-gray">
                {ex.equipment === 'bodyweight' ? '🤸 Bodyweight' : ex.equipment === 'maison' ? '🏠 Maison' : '🏋️ Salle'}
              </span>
            </div>
            <h1 className="page-title">{ex.name}</h1>
            <p className="page-subtitle">{ex.description}</p>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Quick info row */}
        <div className="grid-3" style={{ gap: 12, marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Volume recommandé</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)', marginTop: 4 }}>{ex.duration}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Flame size={12} color="#ef4444" /> Calories brûlées
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ef4444', marginTop: 4 }}>{ex.kcalPerMin} kcal/min</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Muscles ciblés</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: 4, lineHeight: 1.5 }}>
              {ex.muscles.join(', ')}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Steps */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-glow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--primary)' }}>1</span>
                Comment faire ?
              </h2>
              <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ex.steps.map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      background: 'var(--primary-glow)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)',
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Errors */}
            <div className="card" style={{ padding: 24, borderColor: 'rgba(239,68,68,0.2)' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} color="#ef4444" /> Erreurs fréquentes à éviter
              </h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ex.errors.map((err, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: 2 }}>✕</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: variants + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Variants */}
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shuffle size={15} color="var(--blue)" /> Variantes
              </h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ex.variants.map((v, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <CheckCircle size={14} color="var(--blue)" style={{ marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Add to plan CTA */}
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{ex.emoji}</div>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>Intégrer votre plan</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                Ajoutez cet exercice à votre plan d&apos;entraînement personnalisé.
              </p>
              <Link href="/entrainement" className="btn btn-primary" style={{ width: '100%' }}>
                Voir mes plans
              </Link>
            </div>

            {/* Explore more */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>Du même niveau</h3>
              <Link href="/exercices" className="btn btn-ghost" style={{ width: '100%' }}>
                Explorer d&apos;autres exercices
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
