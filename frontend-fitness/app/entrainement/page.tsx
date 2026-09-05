import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Clock, Users, Target, ChevronRight, Calendar, CheckCircle } from 'lucide-react';
import { trainingPlans } from '@/lib/data/plans';
import { auth } from '@/auth';
import { getDb } from '@/lib/mongodb';

const goalLabel: Record<string, string> = {
  'perte-de-poids': '🔥 Perte de poids',
  'prise-de-masse':  '💪 Prise de masse',
  'endurance':       '🏃 Endurance',
  'sante':           '❤️ Santé générale',
};
const levelLabel: Record<string, string> = {
  debutant:     'Débutant',
  intermediaire:'Intermédiaire',
  avance:       'Avancé',
};
const levelColor: Record<string, string> = {
  debutant:     'badge-green',
  intermediaire:'badge-gold',
  avance:       'badge-red',
};
const eqLabel: Record<string, string> = {
  bodyweight: '🤸 Bodyweight',
  maison:     '🏠 Maison',
  salle:      '🏋️ Salle',
};

export default async function EntrainementPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const userId = (session.user as any).id;
  const db = await getDb();
  
  const profile = await db.collection("userProfiles").findOne({ userId });
  if (!profile || !profile.onboardingDone) {
    redirect('/onboarding');
  }

  const activePlanId = profile.activePlanId;
  const activePlan = trainingPlans.find(p => p.id === activePlanId);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏋️ Plans d&apos;entraînement</h1>
        <p className="page-subtitle">Choisissez ou personnalisez votre programme. Adaptés bodyweight et maison.</p>
      </div>

      <div className="page-body">
        {/* Active plan banner */}
        {activePlan && (
          <div style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))',
            border: '1px solid rgba(16,185,129,0.3)',
            marginBottom: 28,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <div className="badge badge-green" style={{ marginBottom: 8 }}>✓ Plan actif</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{activePlan.name}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                {activePlan.sessionsPerWeek} séances/sem · {activePlan.duration} semaines · {eqLabel[activePlan.equipment]}
              </div>
            </div>
            <Link href={`/entrainement/${activePlan.id}`} className="btn btn-primary">
              Continuer la séance →
            </Link>
          </div>
        )}

        <h2 className="section-title">Tous les programmes</h2>

        <div className="grid-2" style={{ gap: 20 }}>
          {trainingPlans.map(plan => (
            <div
              key={plan.id}
              className="card card-glow"
              style={{
                padding: 24,
                border: plan.id === activePlanId ? '1px solid var(--primary)' : '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className={`badge ${levelColor[plan.level]}`}>{levelLabel[plan.level]}</span>
                  <span className="badge badge-gray">{eqLabel[plan.equipment]}</span>
                  {plan.id === activePlanId && <span className="badge badge-green">Actif</span>}
                </div>
              </div>

              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 6 }}>{plan.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{plan.description}</p>

              {/* Meta */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                  { icon: Clock, label: `${plan.duration} semaines` },
                  { icon: Users, label: `${plan.sessionsPerWeek} séances/sem` },
                  { icon: Target, label: goalLabel[plan.goal] },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Icon size={13} />
                    {label}
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {plan.tags.map(t => (
                  <span key={t} className="badge badge-gray" style={{ fontSize: '0.68rem' }}>{t}</span>
                ))}
              </div>

              {/* Weekly overview */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                {plan.weeklyPlan.map(day => (
                  <div
                    key={day.day}
                    title={day.isRest ? `${day.label}: Repos` : `${day.label}: ${day.focus}`}
                    style={{
                      flex: 1, height: 28, borderRadius: 6,
                      background: day.isRest ? 'var(--bg-elevated)' : 'var(--primary-glow)',
                      border: day.isRest ? '1px solid var(--border)' : '1px solid rgba(16,185,129,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.58rem', fontWeight: 700,
                      color: day.isRest ? 'var(--text-muted)' : 'var(--primary)',
                    }}
                  >
                    {day.label.slice(0, 2)}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Link href={`/entrainement/${plan.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  {plan.id === activePlanId ? 'Reprendre' : 'Démarrer'} <ChevronRight size={14} />
                </Link>
                <Link href={`/entrainement/${plan.id}`} className="btn btn-ghost btn-sm">
                  <Calendar size={14} /> Voir le plan
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Create custom plan CTA */}
        <div style={{
          marginTop: 32, padding: '32px 28px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))',
          border: '1px solid rgba(139,92,246,0.2)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🤖</div>
          <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 8 }}>Plan sur-mesure avec l&apos;IA</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.6 }}>
            Répondez à 5 questions et obtenez un plan d&apos;entraînement parfaitement adapté à votre niveau, vos objectifs et votre matériel disponible.
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            {['Votre niveau', 'Votre objectif', 'Équipement dispo', 'Fréquence souhaitée', 'Durée de séance'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <CheckCircle size={13} color="var(--primary)" /> {s}
              </div>
            ))}
          </div>
          <Link href="/coaching" className="btn btn-ghost">
            🤖 Générer mon plan avec l&apos;IA
          </Link>
        </div>
      </div>
    </div>
  );
}
