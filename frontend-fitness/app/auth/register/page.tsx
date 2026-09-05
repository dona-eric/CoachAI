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

      setLoading(false);
      setStep('success');

    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: 'google' | 'github') => {
    signIn(provider, { callbackUrl: '/dashboard' });
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
          >✉️</motion.div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 8 }}>Vérifiez votre email !</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400, margin: '0 auto' }}>
            Nous venons de vous envoyer un lien de confirmation. 
            Veuillez cliquer sur ce lien pour activer votre compte.
          </p>
          <Link href="/auth/login" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>
            Aller à la connexion
          </Link>
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

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <div style={{ padding: '0 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ou s'inscrire avec</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={() => handleOAuthSignIn('google')}
              className="btn btn-ghost" 
              style={{ flex: 1, justifyContent: 'center', border: '1px solid var(--border)' }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button 
              onClick={() => handleOAuthSignIn('github')}
              className="btn btn-ghost" 
              style={{ flex: 1, justifyContent: 'center', border: '1px solid var(--border)' }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24"><path fill="var(--text-primary)" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.43 9.8 8.2 11.38.6.11.82-.26.82-.58 0-.29-.01-1.04-.01-2.04-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013-.4 11.5 11.5 0 013 .4c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.22.7.83.58C20.57 21.79 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </button>
          </div>
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
