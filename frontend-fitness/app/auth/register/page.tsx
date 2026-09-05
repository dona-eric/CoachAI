'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const passwordStrength = (pwd: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (pwd.length >= 8)         score++;
  if (/[A-Z]/.test(pwd))      score++;
  if (/[0-9]/.test(pwd))      score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { label: '', color: 'transparent' },
    { label: 'Faible', color: '#ef4444' },
    { label: 'Moyen', color: '#f59e0b' },
    { label: 'Bon', color: '#10b981' },
    { label: 'Fort 💪', color: '#10b981' },
  ];
  return { score, ...levels[score] };
};

export default function RegisterPage() {
  const router = useRouter();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [step,     setStep]     = useState<'form' | 'success'>('form');

  const strength = passwordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création du compte.');
        setLoading(false);
        return;
      }

      // Auto-login après inscription
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (result?.ok) {
        setStep('success');
        // Rediriger vers l'onboarding pour configurer le profil
        setTimeout(() => router.push('/onboarding'), 1800);
      } else {
        setStep('success');
        setTimeout(() => router.push('/auth/login'), 1800);
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: 'spring' }}
          style={{ textAlign: 'center', padding: 40 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            style={{ fontSize: '4rem', marginBottom: 16 }}
          >🎉</motion.div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 8 }}>Bienvenue sur KINETIC !</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Préparation de votre profil personnalisé...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg-base)', overflow: 'hidden',
    }}>
      {/* Left branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '60px 80px',
          background: 'radial-gradient(ellipse 80% 70% at 30% 50%, rgba(16,185,129,0.15) 0%, transparent 70%)',
          borderRight: '1px solid var(--border)',
        }}
        className="auth-left-panel"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #065f46, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16,185,129,0.4)',
          }}>
            <Zap size={22} color="#000" fill="#000" />
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.03em' }}>KINETIC</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
            Rejoignez des milliers<br />
            <span className="text-gradient">d&apos;athlètes KINETIC.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 400 }}>
            Créez votre compte gratuitement et commencez votre transformation dès aujourd&apos;hui.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {[
            ['✅', 'Plan d\'entraînement IA en 5 minutes'],
            ['✅', 'Bibliothèque de 100+ exercices'],
            ['✅', 'Suivi nutrition adapté à votre réalité'],
            ['✅', '100% gratuit pour commencer'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', gap: 10, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              <span>{icon}</span> {text}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', flexShrink: 0 }}
        className="auth-right-panel"
      >
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>
            Créer un compte
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 28 }}>
            Déjà membre ?{' '}
            <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: 10, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, marginBottom: 20, fontSize: '0.85rem', color: '#ef4444' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Name */}
            <div>
              <label className="label">Prénom & Nom</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input className="input" style={{ paddingLeft: 38 }} placeholder="Aminata Koné" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input type="email" className="input" style={{ paddingLeft: 38 }} placeholder="vous@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type={showPwd ? 'text' : 'password'} className="input"
                  style={{ paddingLeft: 38, paddingRight: 38 }}
                  placeholder="Minimum 8 caractères" value={password}
                  onChange={e => setPassword(e.target.value)} required minLength={6}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength indicator */}
              {password.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 99,
                        background: i <= strength.score ? strength.color : 'var(--bg-elevated)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  {strength.label && (
                    <div style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 600 }}>{strength.label}</div>
                  )}
                </motion.div>
              )}
            </div>

            <motion.button
              type="submit" className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 4 }}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width={16} height={16} viewBox="0 0 16 16" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx={8} cy={8} r={6} fill="none" stroke="#000" strokeWidth={2} strokeDasharray="28 8" />
                  </svg>
                  Création en cours...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Créer mon compte <ArrowRight size={16} />
                </span>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-left-panel  { display: none !important; }
          .auth-right-panel { width: 100% !important; padding: 40px 24px !important; }
        }
      `}</style>
    </div>
  );
}
