'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get('callbackUrl') || '/dashboard';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Email ou mot de passe incorrect. Essayez : eric@kinetic.fr / kinetic123');
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-base)',
      overflow: 'hidden',
    }}>
      {/* ── Left panel — branding ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          background: 'radial-gradient(ellipse 80% 70% at 30% 50%, rgba(16,185,129,0.18) 0%, transparent 70%)',
          borderRight: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="auth-left-panel"
      >
        {/* Decorative orb */}
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          bottom: -150, right: -150, pointerEvents: 'none',
        }} />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 20,
          }}>
            Votre coach fitness<br />
            <span className="text-gradient">toujours avec vous.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 420 }}>
            Plans personnalisés, suivi des performances, nutrition adaptée. 
            Entraînez-vous n&apos;importe où — avec ou sans équipement.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 40 }}
        >
          {['🏋️ Plans IA', '📈 Suivi', '🥗 Nutrition', '💆 Récupération', '🔥 Streak'].map(f => (
            <span key={f} className="badge badge-green" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>{f}</span>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Right panel — form ── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          width: 480,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 48px',
          flexShrink: 0,
        }}
        className="auth-right-panel"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
        >
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>
            Connexion
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 32 }}>
            Pas encore de compte ?{' '}
            <Link href="/auth/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Créer un compte
            </Link>
          </p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10, marginBottom: 20, fontSize: '0.85rem', color: '#ef4444',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label className="label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  id="email"
                  type="email"
                  className="input"
                  style={{ paddingLeft: 38 }}
                  placeholder="eric@kinetic.fr"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="input"
                  style={{ paddingLeft: 38, paddingRight: 38 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Demo hint */}
            <div style={{
              padding: '10px 14px', background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8,
              fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5,
            }}>
              💡 <strong>Compte démo :</strong> eric@kinetic.fr · kinetic123
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 4, position: 'relative', overflow: 'hidden' }}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width={16} height={16} viewBox="0 0 16 16" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx={8} cy={8} r={6} fill="none" stroke="#000" strokeWidth={2} strokeDasharray="28 8" />
                  </svg>
                  Connexion...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Se connecter <ArrowRight size={16} />
                </span>
              )}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            En vous connectant, vous acceptez nos{' '}
            <span style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>Conditions d&apos;utilisation</span>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
          .auth-right-panel { width: 100% !important; padding: 40px 24px !important; }
        }
      `}</style>
    </div>
  );
}
