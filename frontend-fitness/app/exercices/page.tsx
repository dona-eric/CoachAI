'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronRight } from 'lucide-react';
import { exercises, filterExercises } from '@/lib/data/exercises';

const equipmentOpts = [
  { value: 'all',         label: 'Tout équipement' },
  { value: 'bodyweight',  label: '🤸 Bodyweight' },
  { value: 'maison',      label: '🏠 Maison' },
  { value: 'salle',       label: '🏋️ Salle' },
];
const categoryOpts = [
  { value: 'all',      label: 'Toutes catégories' },
  { value: 'force',    label: '💪 Force' },
  { value: 'cardio',   label: '⚡ Cardio' },
  { value: 'core',     label: '🧘 Core' },
  { value: 'mobilite', label: '🌟 Mobilité' },
];
const levelOpts = [
  { value: 'all',          label: 'Tous niveaux' },
  { value: 'debutant',     label: '🟢 Débutant' },
  { value: 'intermediaire',label: '🟡 Intermédiaire' },
  { value: 'avance',       label: '🔴 Avancé' },
];

const levelColor: Record<string, string> = {
  debutant: 'badge-green',
  intermediaire: 'badge-gold',
  avance: 'badge-red',
};
const levelLabel: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};
const catColor: Record<string, string> = {
  force: 'badge-blue',
  cardio: 'badge-red',
  core: 'badge-purple',
  mobilite: 'badge-green',
};

export default function ExercicesPage() {
  const [equipment, setEquipment] = useState('all');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = filterExercises(
    equipment === 'all' ? undefined : equipment,
    category === 'all' ? undefined : category,
    level === 'all' ? undefined : level,
  ).filter(e =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.muscles.some(m => m.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📚 Bibliothèque d&apos;exercices</h1>
        <p className="page-subtitle">{exercises.length} exercices · Filtrez par niveau, matériel et catégorie</p>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 36 }}
              placeholder="Rechercher un exercice ou un muscle..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input" style={{ flex: '0 1 180px' }} value={equipment} onChange={e => setEquipment(e.target.value)}>
            {equipmentOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="input" style={{ flex: '0 1 180px' }} value={category} onChange={e => setCategory(e.target.value)}>
            {categoryOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="input" style={{ flex: '0 1 180px' }} value={level} onChange={e => setLevel(e.target.value)}>
            {levelOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Filter size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {filtered.length} exercice{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid-3" style={{ gap: 16 }}>
            {filtered.map(ex => (
              <Link key={ex.id} href={`/exercices/${ex.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card card-glow exercise-card">
                  {/* Thumbnail */}
                  <div className="ex-thumb" style={{
                    background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))',
                    flexDirection: 'column', gap: 4,
                  }}>
                    <span style={{ fontSize: '2.5rem' }}>{ex.emoji}</span>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>~{ex.kcalPerMin} kcal/min</div>
                  </div>
                  {/* Body */}
                  <div className="ex-body">
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span className={`badge ${levelColor[ex.level]}`}>{levelLabel[ex.level]}</span>
                      <span className={`badge ${catColor[ex.category]}`}>{ex.category}</span>
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{ex.name}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>
                      {ex.muscles.join(' · ')}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {ex.equipment === 'bodyweight' ? '🤸 Bodyweight' : ex.equipment === 'maison' ? '🏠 Maison' : '🏋️ Salle'}
                      </span>
                      <ChevronRight size={15} color="var(--text-muted)" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Aucun exercice trouvé</div>
            <div style={{ fontSize: '0.85rem', marginTop: 4 }}>Essayez de modifier vos filtres</div>
          </div>
        )}
      </div>
    </div>
  );
}
