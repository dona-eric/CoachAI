'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const steps = [
  {
    id: 'goal',
    title: 'Quel est votre objectif ?',
    subtitle: 'On va personnaliser votre expérience KINETIC.',
    options: [
      { value: 'perte-de-poids',  label: 'Perte de poids',   emoji: '🔥', desc: 'Brûler des graisses, affiner ma silhouette' },
      { value: 'prise-de-masse',  label: 'Prise de masse',   emoji: '💪', desc: 'Gagner du muscle et de la force' },
      { value: 'endurance',       label: 'Endurance',         emoji: '🏃', desc: 'Améliorer mon cardio et ma résistance' },
      { value: 'sante',           label: 'Santé générale',    emoji: '❤️', desc: 'Rester actif, me sentir mieux' },
    ],
  },
  {
    id: 'level',
    title: 'Quel est votre niveau ?',
    subtitle: 'Soyez honnête — on adaptera l\'intensité.',
    options: [
      { value: 'debutant',      label: 'Débutant',      emoji: '🌱', desc: 'Je commence ou je reprends le sport' },
      { value: 'intermediaire', label: 'Intermédiaire', emoji: '⚡', desc: 'Je m\'entraîne régulièrement' },
      { value: 'avance',        label: 'Avancé',        emoji: '🔥', desc: 'Je m\'entraîne intensément depuis longtemps' },
    ],
  },
  {
    id: 'equipment',
    title: 'Quel équipement avez-vous ?',
    subtitle: 'Sélectionnez tout ce que vous avez à disposition.',
    multi: true,
    options: [
      { value: 'bodyweight', label: 'Rien du tout',       emoji: '🤸', desc: 'Mon corps suffit (bodyweight)' },
      { value: 'maison',     label: 'Matériel maison',    emoji: '🏠', desc: 'Chaise, mur, bouteilles lestées…' },
      { value: 'salle',      label: 'Salle de sport',     emoji: '🏋️', desc: 'Haltères, barres, machines' },
    ],
  },
  {
    id: 'body',
    title: 'Vos mensurations',
    subtitle: 'Pour calculer vos besoins caloriques précis.',
    fields: true,
  },
];

const slide = {
  hidden:  (dir: number) => ({ opacity: 0, x: dir * 60 }),
  visible: { opacity: 1, x: 0 },
  exit:    (dir: number) => ({ opacity: 0, x: dir * -60 }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [stepIdx,  setStepIdx]  = useState(0);
  const [dir,      setDir]      = useState(1);
  const [loading,  setLoading]  = useState(false);

  const [goal,      setGoal]      = useState('');
  const [level,     setLevel]     = useState('');
  const [equipment, setEquipment] = useState<string[]>(['bodyweight']);
  const [age,       setAge]       = useState('');
  const [height,    setHeight]    = useState('');
  const [weight,    setWeight]    = useState('');

  const current = steps[stepIdx];
  const isLast  = stepIdx === steps.length - 1;

  const canNext = () => {
    if (current.id === 'goal')      return !!goal;
    if (current.id === 'level')     return !!level;
    if (current.id === 'equipment') return equipment.length > 0;
    if (current.id === 'body')      return !!age && !!height && !!weight;
    return false;
  };

  const toggleEquipment = (val: string) => {
    setEquipment(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const handleNext = async () => {
    if (!canNext()) return;
    if (!isLast) {
      setDir(1);
      setStepIdx(i => i + 1);
      return;
    }
    // Dernière étape → sauvegarder
    setLoading(true);
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal, level, equipment,
          age:    parseInt(age),
          height: parseInt(height),
          weight: parseFloat(weight),
          onboardingDone: true,
        }),
      });
      router.push('/dashboard');
    } catch {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (stepIdx === 0) return;
    setDir(-1);
    setStepIdx(i => i - 1);
  };

  const OptionCard = ({ opt, selected, onSelect }: { opt: any; selected: boolean; onSelect: () => void }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      style={{
        width: '100%', padding: '16px 18px', borderRadius: 14, cursor: 'pointer',
        background: selected ? 'rgba(16,185,129,0.1)' : 'var(--bg-elevated)',
        border: selected ? '2px solid var(--primary)' : '2px solid transparent',
        display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{opt.emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: selected ? 'var(--primary)' : 'var(--text-primary)' }}>
          {opt.label}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</div>
      </div>
      {selected && <Check size={18} color="var(--primary)" style={{ flexShrink: 0 }} />}
    </motion.button>
  );

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #065f46, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(16,185,129,0.35)' }}>
            <Zap size={17} color="#000" fill="#000" />
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.03em' }}>KINETIC</span>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 36 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: i <= stepIdx ? '100%' : '0%' }}
                transition={{ duration: 0.4 }}
                style={{ height: '100%', background: 'var(--primary)', borderRadius: 99 }}
              />
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={stepIdx} custom={dir} variants={slide} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.35, ease: 'easeOut' as const }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 6, letterSpacing: '-0.02em' }}>
              {current.title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
              {current.subtitle}
            </p>

            {/* Options */}
            {current.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {current.options.map(opt => {
                  const selected = current.multi
                    ? equipment.includes(opt.value)
                    : (current.id === 'goal' ? goal : level) === opt.value;
                  return (
                    <OptionCard
                      key={opt.value} opt={opt} selected={selected}
                      onSelect={() => {
                        if (current.multi) toggleEquipment(opt.value);
                        else if (current.id === 'goal') setGoal(opt.value);
                        else setLevel(opt.value);
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Body measurements */}
            {current.fields && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Âge (années)',   value: age,    set: setAge,    type: 'number', placeholder: 'ex: 25', min: '10', max: '100' },
                  { label: 'Taille (cm)',     value: height, set: setHeight, type: 'number', placeholder: 'ex: 175', min: '100', max: '250' },
                  { label: 'Poids actuel (kg)', value: weight, set: setWeight, type: 'number', placeholder: 'ex: 70', min: '30', max: '300', step: '0.1' },
                ].map(({ label, value, set, type, placeholder, min, max, step }) => (
                  <div key={label}>
                    <label className="label">{label}</label>
                    <input
                      className="input" type={type} placeholder={placeholder}
                      value={value} onChange={e => set(e.target.value)}
                      min={min} max={max} step={step ?? '1'}
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          {stepIdx > 0 && (
            <button className="btn btn-ghost" onClick={handleBack} style={{ flexShrink: 0 }}>
              <ChevronLeft size={16} /> Retour
            </button>
          )}
          <motion.button
            whileHover={{ scale: canNext() ? 1.02 : 1 }}
            whileTap={{ scale: canNext() ? 0.98 : 1 }}
            className="btn btn-primary btn-lg"
            style={{ flex: 1, opacity: canNext() ? 1 : 0.4, cursor: canNext() ? 'pointer' : 'not-allowed' }}
            onClick={handleNext}
            disabled={!canNext() || loading}
          >
            {loading ? 'Enregistrement...' : isLast ? 'Commencer KINETIC 🚀' : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Continuer <ChevronRight size={16} />
              </span>
            )}
          </motion.button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Étape {stepIdx + 1} sur {steps.length}
        </p>
      </div>
    </div>
  );
}
