import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Edit3, Target, Dumbbell, Award } from 'lucide-react';
import { auth } from '@/auth';
import { getDb } from '@/lib/mongodb';
import { badges } from '@/lib/data/user'; // On garde les badges en local (catalogue)

const goalLabel: Record<string, string> = {
  'perte-de-poids': '🔥 Perte de poids',
  'prise-de-masse':  '💪 Prise de masse',
  'endurance':       '🏃 Endurance',
  'sante':           '❤️ Santé générale',
};
const levelLabel: Record<string, string> = {
  debutant:     '🟢 Débutant',
  intermediaire:'🟡 Intermédiaire',
  avance:       '🔴 Avancé',
};

export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const userId = (session.user as any).id;
  const db = await getDb();

  // Fetch du profil
  const profile = await db.collection("userProfiles").findOne({ userId });
  if (!profile || !profile.onboardingDone) {
    redirect('/onboarding');
  }

  // Fetch stats depuis MongoDB
  const sessions = await db.collection("workoutSessions").find({ userId }).toArray();
  const totalSessions = sessions.length;
  const totalCalories = sessions.reduce((a, s) => a + (s.calories as number ?? 0), 0);

  // Fetch records depuis MongoDB
  const personalRecords = await db.collection("personalRecords").find({ userId }).sort({ date: -1 }).toArray();

  const unlockedBadges = badges.filter(b => b.unlocked); // TODO: Lier à la DB plus tard

  const weight = profile.weight as number ?? 0;
  const height = profile.height as number ?? 0;
  const bmi = height > 0 && weight > 0 ? (weight / ((height / 100) ** 2)).toFixed(1) : '--';
  const age = profile.age as number ?? '--';
  const streak = profile.streak as number ?? 0;
  const equipment = (profile.equipment as string[]) ?? [];

  // Date d'inscription depuis user (pas profile)
  const userRecord = await db.collection("users").findOne({ _id: profile.userId as any }); // TODO: fix type si c'est ObjectID
  const joinDate = userRecord?.createdAt ? new Date(userRecord.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Récemment';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👤 Mon Profil</h1>
        <p className="page-subtitle">Vos informations, objectifs et réalisations.</p>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
          {/* Left: Profile card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 28, textAlign: 'center' }}>
              {/* Avatar */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #065f46, #10b981)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: 700, color: '#000',
                border: '3px solid var(--primary)',
                boxShadow: '0 0 20px rgba(16,185,129,0.3)',
              }}>
                {session.user.name?.[0].toUpperCase()}
              </div>

              <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 4 }}>{session.user.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>{session.user.email}</p>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
                <span className="badge badge-green">{levelLabel[profile.level as string]}</span>
                <span className="badge badge-blue">{goalLabel[profile.goal as string]}</span>
              </div>

              {/* Streak */}
              <div style={{
                padding: '12px 0', borderRadius: 12,
                background: 'var(--bg-elevated)',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
                  🔥 {streak}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>jours d&apos;affilée</div>
              </div>

              <button className="btn btn-ghost" style={{ width: '100%' }}>
                <Edit3 size={14} /> Modifier le profil
              </button>
            </div>

            {/* Physical stats */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14 }}>📊 Données physiques</h3>
              {[
                ['Âge', `${age} ans`],
                ['Taille', height > 0 ? `${height} cm` : '--'],
                ['Poids', weight > 0 ? `${weight} kg` : '--'],
                ['IMC', bmi],
                ['Membre depuis', joinDate],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Equipment */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14 }}>🛠️ Équipement disponible</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {equipment.length > 0 ? equipment.map(eq => (
                  <span key={eq} className="badge badge-blue" style={{ fontSize: '0.8rem' }}>
                    {eq === 'bodyweight' ? '🤸 Bodyweight' : eq === 'maison' ? '🏠 Maison' : '🏋️ Salle'}
                  </span>
                )) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Aucun équipement défini</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Stats + Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Stats globales */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={16} color="var(--primary)" /> Statistiques globales
              </h2>
              <div className="grid-4" style={{ gap: 12 }}>
                {[
                  { label: 'Séances totales', value: totalSessions, color: 'var(--primary)' },
                  { label: 'Calories totales', value: `${totalCalories.toLocaleString('fr')} kcal`, color: '#ef4444' },
                  { label: 'Semaines actives', value: '--', color: 'var(--blue)' },
                  { label: 'Badges débloqués', value: `${unlockedBadges.length}/${badges.length}`, color: 'var(--gold)' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="stat-card">
                    <div className="stat-label">{label}</div>
                    <div style={{ fontWeight: 800, fontSize: '1.3rem', color, marginTop: 4 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={16} color="var(--gold)" /> Badges & Achievements
              </h2>
              <div className="grid-3" style={{ gap: 12 }}>
                {badges.map(b => (
                  <div
                    key={b.id}
                    style={{
                      padding: '16px 12px', borderRadius: 12, textAlign: 'center',
                      background: b.unlocked ? 'var(--gold-dim)' : 'var(--bg-elevated)',
                      border: b.unlocked ? '1px solid rgba(245,158,11,0.25)' : '1px solid var(--border)',
                      opacity: b.unlocked ? 1 : 0.5,
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: 6, filter: b.unlocked ? 'none' : 'grayscale(1)' }}>{b.emoji}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', marginBottom: 3, color: b.unlocked ? 'var(--gold)' : 'var(--text-muted)' }}>{b.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{b.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Records */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Dumbbell size={16} color="var(--blue)" /> Records personnels
              </h2>
              {personalRecords.length > 0 ? (
                <div className="grid-2" style={{ gap: 10 }}>
                  {personalRecords.map((pr: any) => (
                    <div key={pr.exerciseName} style={{ padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{pr.emoji} {pr.exerciseName}</span>
                        <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{pr.value}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Établi le {pr.date}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aucun record personnel pour le moment. Allez vous entraîner ! 💪</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
