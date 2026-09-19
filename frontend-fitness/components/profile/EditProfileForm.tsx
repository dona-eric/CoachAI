'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';

type ProfileValues = Pick<UserProfile, 'age' | 'height' | 'weight' | 'level' | 'goal' | 'equipment'> & {
  name: string;
  email: string;
};

const goals: Array<{ value: UserProfile['goal']; label: string }> = [
  { value: 'perte-de-poids', label: 'Perte de poids' },
  { value: 'prise-de-masse', label: 'Prise de masse' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'sante', label: 'Santé générale' },
];
const levels: Array<{ value: UserProfile['level']; label: string }> = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
];
const equipmentOptions = [
  { value: 'bodyweight', label: '🤸 Poids du corps' },
  { value: 'maison', label: '🏠 Matériel maison' },
  { value: 'salle', label: '🏋️ Salle de sport' },
];

export default function EditProfileForm({ initialValues }: { initialValues: ProfileValues }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = <K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) => {
    setValues(current => ({ ...current, [key]: value }));
  };

  const toggleEquipment = (value: string) => {
    update('equipment', values.equipment.includes(value)
      ? values.equipment.filter(item => item !== value)
      : [...values.equipment, value]);
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          age: Number(values.age),
          height: Number(values.height),
          weight: Number(values.weight),
          level: values.level,
          goal: values.goal,
          equipment: values.equipment,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? 'Impossible de mettre à jour le profil.');
      setOpen(false);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erreur de sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => { setError(''); setOpen(true); }}>
        ✎ Modifier le profil
      </button>
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <form onSubmit={save} className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Modifier mon profil</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>Ces informations servent à personnaliser vos séances et objectifs.</p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} aria-label="Fermer"><X size={16} /></button>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <label className="input-label">Nom
                <input className="input" value={values.name} onChange={event => update('name', event.target.value)} required minLength={2} />
              </label>
              <label className="input-label">Email
                <input className="input" value={values.email} disabled />
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 4 }}>L&apos;email ne peut pas être modifié depuis cette page.</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {([
                  ['age', 'Âge', '13', '100', '1'],
                  ['height', 'Taille (cm)', '100', '250', '1'],
                  ['weight', 'Poids (kg)', '25', '400', '0.1'],
                ] as const).map(([key, label, min, max, step]) => (
                  <label className="input-label" key={key}>{label}
                    <input className="input" type="number" min={min} max={max} step={step} value={values[key] ?? ''} onChange={event => update(key, Number(event.target.value) as never)} required />
                  </label>
                ))}
              </div>
              <label className="input-label">Objectif
                <select className="input" value={values.goal} onChange={event => update('goal', event.target.value as UserProfile['goal'])}>
                  {goals.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="input-label">Niveau
                <select className="input" value={values.level} onChange={event => update('level', event.target.value as UserProfile['level'])}>
                  {levels.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <div className="input-label">Équipement disponible
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {equipmentOptions.map(option => (
                    <button type="button" key={option.value} className={`btn btn-sm ${values.equipment.includes(option.value) ? 'btn-primary' : 'btn-ghost'}`} onClick={() => toggleEquipment(option.value)}>
                      {values.equipment.includes(option.value) && <Check size={13} />} {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 14 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
