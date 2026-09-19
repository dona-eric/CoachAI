'use client';

import { useEffect, useState } from 'react';
import type { ExerciseProgressPoint } from '@/lib/types';

interface ExerciseSummary {
  exerciseId: string;
  exerciseName: string;
  sessions: number;
  totalVolume: number;
  bestWeight: number;
  bestReps: number;
}

interface ProgressResponse {
  exercises: Array<ExerciseSummary & { points: ExerciseProgressPoint[] }>;
}

export default function ExerciseProgressExplorer({ exercises }: { exercises: ExerciseSummary[] }) {
  const [selectedId, setSelectedId] = useState(exercises[0]?.exerciseId ?? '');
  const [detail, setDetail] = useState<ProgressResponse['exercises'][number] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/workouts/progress?exerciseId=${encodeURIComponent(selectedId)}`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Impossible de charger la progression');
        return response.json() as Promise<ProgressResponse>;
      })
      .then(data => setDetail(data.exercises[0] ?? null))
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('[PERFORMANCE] Failed to load exercise progress:', error);
        setDetail(null);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [selectedId]);

  return (
    <div className="card" style={{ padding: 24, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Détail d&apos;un exercice</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Historique calculé depuis vos séries enregistrées.</p>
        </div>
        <select className="input" value={selectedId} onChange={event => setSelectedId(event.target.value)} style={{ maxWidth: 260 }}>
          {exercises.map(exercise => <option key={exercise.exerciseId} value={exercise.exerciseId}>{exercise.exerciseName}</option>)}
        </select>
      </div>

      {!exercises.length ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aucune progression disponible pour le moment.</div>
      ) : loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chargement de l&apos;historique...</div>
      ) : detail ? (
        <>
          <div className="grid-4" style={{ gap: 10, marginBottom: 18 }}>
            {[
              ['Séances', detail.sessions],
              ['Meilleure charge', detail.bestWeight > 0 ? `${detail.bestWeight} kg` : 'Poids du corps'],
              ['Meilleures répétitions', detail.bestReps],
              ['Volume total', detail.totalVolume > 0 ? `${Math.round(detail.totalVolume).toLocaleString('fr')} kg` : '—'],
            ].map(([label, value]) => (
              <div key={String(label)} className="stat-card">
                <div className="stat-label">{label}</div>
                <div style={{ fontWeight: 800, marginTop: 4, fontSize: '1rem' }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '9px 8px' }}>Séance</th>
                  <th style={{ padding: '9px 8px' }}>Séries</th>
                  <th style={{ padding: '9px 8px' }}>Répétitions</th>
                  <th style={{ padding: '9px 8px' }}>Charge max</th>
                  <th style={{ padding: '9px 8px', textAlign: 'right' }}>Volume</th>
                </tr>
              </thead>
              <tbody>
                {detail.points.slice().reverse().map(point => (
                  <tr key={point.date} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 8px', fontWeight: 600 }}>{point.date}</td>
                    <td style={{ padding: '11px 8px' }}>{point.sets}</td>
                    <td style={{ padding: '11px 8px' }}>{point.reps || '—'}</td>
                    <td style={{ padding: '11px 8px' }}>{point.bestWeight > 0 ? `${point.bestWeight} kg` : 'Poids du corps'}</td>
                    <td style={{ padding: '11px 8px', textAlign: 'right', color: 'var(--primary)', fontWeight: 700 }}>
                      {point.volume > 0 ? `${Math.round(point.volume).toLocaleString('fr')} kg` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>L&apos;historique est indisponible.</div>
      )}
    </div>
  );
}
