'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage('Lien invalide ou incomplet.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email }),
        });

        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email vérifié avec succès.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Erreur lors de la vérification.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Une erreur est survenue lors de la vérification.');
      }
    };

    verify();
  }, [token, email]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card" 
        style={{ padding: 40, maxWidth: 400, width: '100%', textAlign: 'center' }}
      >
        <div style={{ marginBottom: 20 }}>
          {status === 'loading' && (
            <svg width={48} height={48} viewBox="0 0 16 16" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }}>
              <circle cx={8} cy={8} r={6} fill="none" stroke="var(--primary)" strokeWidth={2} strokeDasharray="28 8" />
            </svg>
          )}
          {status === 'success' && <CheckCircle size={56} color="var(--primary)" style={{ margin: '0 auto' }} />}
          {status === 'error' && <XCircle size={56} color="#ef4444" style={{ margin: '0 auto' }} />}
        </div>
        
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>
          {status === 'loading' ? 'Vérification...' : status === 'success' ? 'Compte vérifié !' : 'Erreur de vérification'}
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: 30, fontSize: '0.9rem', lineHeight: 1.5 }}>
          {message}
        </p>

        {status !== 'loading' && (
          <Link href="/auth/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Aller à la connexion
          </Link>
        )}
      </motion.div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
