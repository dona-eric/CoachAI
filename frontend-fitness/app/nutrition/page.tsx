'use client';
import { useState, useEffect } from 'react';
import { Droplets, Plus, Minus, Search, Flame, Beef, Wheat, Droplet } from 'lucide-react';
import { calculateTDEE, foods } from '@/lib/data/nutrition'; // On garde les aliments mockés comme base de données "recherche"

function MacroDonut({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein * 4 + carbs * 4 + fat * 9;
  if (total === 0) return (
    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aucune donnée aujourd'hui</div>
  );
  const pP = (protein * 4 / total) * 100;
  const pC = (carbs * 4 / total) * 100;

  const size = 120, cx = 60, cy = 60, r = 48, circ = 2 * Math.PI * r;
  const segs = [
    { pct: pP / 100, color: '#10b981', label: 'Protéines' },
    { pct: pC / 100, color: '#3b82f6', label: 'Glucides' },
    { pct: (100 - pP - pC) / 100, color: '#f59e0b', label: 'Lipides' },
  ];
  let offset = 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segs.map((s, i) => {
          const dash = s.pct * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={14}
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={-offset * circ}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += s.pct;
          return el;
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-primary)" fontSize="15" fontWeight="800">{Math.round(total)} kcal</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-muted)" fontSize="9">aujourd'hui</text>
      </svg>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[['#10b981','Prot.', `${Math.round(protein)}g`], ['#3b82f6','Gluc.', `${Math.round(carbs)}g`], ['#f59e0b','Lip.', `${Math.round(fat)}g`]].map(([c, l, v]) => (
          <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c as string }} />
            <span style={{ color: 'var(--text-muted)' }}>{l}</span>
            <span style={{ fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const [profile, setProfile] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [water, setWater] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'matin' | 'midi' | 'soir' | 'collation'>('midi');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const fetchNutrition = async () => {
    try {
      const res = await fetch('/api/nutrition');
      if (res.ok) {
        const data = await res.json();
        setMeals(data.meals || []);
        setWater(data.water || 0);
      }
    } catch (e) {
      console.error("Error fetching nutrition", e);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/user/profile').then(r => r.json()),
      fetchNutrition()
    ]).then(([prof]) => {
      if (!prof.error) setProfile(prof);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const addWater = async (amount: number) => {
    const newWater = Math.max(0, water + amount);
    setWater(newWater);
    await fetch('/api/nutrition/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: newWater }),
    });
  };

  const addFood = async (food: any) => {
    setIsAdding(food.id);
    await fetch('/api/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meal: activeTab,
        foodName: food.name,
        emoji: food.emoji,
        quantity: 100, // portion par défaut
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      }),
    });
    await fetchNutrition();
    setIsAdding(null);
  };

  const removeFood = async (id: string) => {
    await fetch(`/api/nutrition?id=${id}`, { method: 'DELETE' });
    await fetchNutrition();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width={24} height={24} viewBox="0 0 16 16" style={{ animation: 'spin 0.8s linear infinite' }}>
            <circle cx={8} cy={8} r={6} fill="none" stroke="var(--primary)" strokeWidth={2} strokeDasharray="28 8" />
          </svg>
          <span style={{ color: 'var(--text-secondary)' }}>Chargement...</span>
        </div>
      </div>
    );
  }

  // Calcul TDEE
  const weight = profile?.weight || 70;
  const height = profile?.height || 170;
  const age = profile?.age || 30;
  const targetCalories = calculateTDEE(weight, height, age, true, 1.55); // true = masculin pr le moment, simplifé
  const targetProtein = Math.round(weight * 2);
  const targetCarbs   = Math.round((targetCalories * 0.45) / 4);
  const targetFat     = Math.round((targetCalories * 0.25) / 9);

  const waterGoal = 2500;

  const totalToday = meals.reduce((a, m) => ({
    calories: a.calories + (m.calories || 0),
    protein:  a.protein  + (m.protein || 0),
    carbs:    a.carbs    + (m.carbs || 0),
    fat:      a.fat      + (m.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const mealsByType = (type: typeof activeTab) => meals.filter(m => m.meal === type);
  const waterPct = Math.min((water / waterGoal) * 100, 100);

  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 6);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🥗 Nutrition & Hydratation</h1>
        <p className="page-subtitle">Suivez votre alimentation et atteignez vos objectifs caloriques.</p>
      </div>

      <div className="page-body">
        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 220px', gap: 16, marginBottom: 24 }}>
          {/* Calories progress */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Calories du jour
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{Math.round(totalToday.calories)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/ {targetCalories} kcal</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min((totalToday.calories / targetCalories) * 100, 100)}%` }} />
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
              {[['Protéines', Math.round(totalToday.protein), targetProtein, 'g', '#10b981'],
                ['Glucides',  Math.round(totalToday.carbs),   targetCarbs,   'g', '#3b82f6'],
                ['Lipides',   Math.round(totalToday.fat),     targetFat,     'g', '#f59e0b']].map(([l, v, t, u, c]) => (
                <div key={l as string} style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 3 }}>{l}</div>
                  <div style={{ height: 3, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(((v as number) / (t as number)) * 100, 100)}%`, background: c as string, borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, marginTop: 2 }}>{v}{u}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Donut */}
          <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MacroDonut protein={totalToday.protein} carbs={totalToday.carbs} fat={totalToday.fat} />
          </div>

          {/* Water */}
          <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Droplets size={20} color="var(--blue)" />
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Hydratation</div>
            <div style={{ position: 'relative', width: 80, height: 80 }}>
              <svg width={80} height={80} viewBox="0 0 80 80">
                <circle cx={40} cy={40} r={32} fill="none" stroke="var(--bg-elevated)" strokeWidth={8} />
                <circle cx={40} cy={40} r={32} fill="none" stroke="var(--blue)" strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={`${(waterPct / 100) * (2 * Math.PI * 32)} ${2 * Math.PI * 32}`}
                  transform="rotate(-90 40 40)"
                />
                <text x={40} y={44} textAnchor="middle" fill="var(--blue)" fontSize="12" fontWeight="800">{Math.round(waterPct)}%</text>
              </svg>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{water}ml / {waterGoal}ml</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => addWater(-250)}>
                <Minus size={12} />
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => addWater(250)}>
                <Plus size={12} /> 250ml
              </button>
            </div>
          </div>
        </div>

        {/* Meal journal + search */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Journal */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Journal alimentaire</h2>
            <div className="tabs" style={{ marginBottom: 20 }}>
              {(['matin', 'midi', 'soir', 'collation'] as const).map(t => (
                <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                  {t === 'matin' ? '☀️' : t === 'midi' ? '🌤' : t === 'soir' ? '🌙' : '🍎'} {t}
                </button>
              ))}
            </div>
            {mealsByType(activeTab).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {mealsByType(activeTab).map(m => (
                  <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 10 }}>
                    <span style={{ fontSize: '1.4rem' }}>{m.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.foodName}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{m.quantity}g · P: {m.protein}g · G: {m.carbs}g · L: {m.fat}g</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>{m.calories} kcal</div>
                    <button onClick={() => removeFood(m._id)} className="btn btn-ghost btn-sm" style={{ padding: '4px 6px', color: '#ef4444' }}>
                      <Minus size={14} />
                    </button>
                  </div>
                ))}
                <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
                  <span>Total {activeTab}</span>
                  <span style={{ color: 'var(--primary)' }}>
                    {mealsByType(activeTab).reduce((a, m) => a + m.calories, 0)} kcal
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🍽️</div>
                <div style={{ fontWeight: 600 }}>Aucun repas enregistré</div>
                <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Recherchez un aliment à droite pour ajouter.</div>
              </div>
            )}
          </div>

          {/* Food search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 12 }}>🔍 Ajouter un aliment</h3>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" style={{ paddingLeft: 32, fontSize: '0.85rem' }} placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredFoods.map(f => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                    <span>{f.emoji}</span>
                    <div style={{ flex: 1, fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 600 }}>{f.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{f.calories} kcal / 100g</div>
                    </div>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ padding: '4px 8px' }}
                      onClick={() => addFood(f)}
                      disabled={isAdding === f.id}
                    >
                      {isAdding === f.id ? '...' : '+'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* TDEE info */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>🎯 Vos besoins estimés</h3>
              {[
                { label: 'Calories', value: `${targetCalories} kcal`, icon: Flame, color: '#ef4444' },
                { label: 'Protéines', value: `${targetProtein}g`, icon: Beef, color: '#10b981' },
                { label: 'Glucides', value: `${targetCarbs}g`, icon: Wheat, color: '#3b82f6' },
                { label: 'Lipides', value: `${targetFat}g`, icon: Droplet, color: '#f59e0b' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <Icon size={13} color={color} /> {label}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{value}</span>
                </div>
              ))}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.4 }}>
                Calculé avec la formule Mifflin-St Jeor pour votre profil.
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
