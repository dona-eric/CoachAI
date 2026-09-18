'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: params.get('token'), email: params.get('email'), password }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? 'Impossible de réinitialiser le mot de passe.');
      return;
    }
    router.push('/auth/login?reset=success');
  }

  return (
    <div className="card" style={{ maxWidth: 440, margin: '12vh auto', padding: 32 }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Nouveau mot de passe</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Utilisez au moins 8 caractères, une lettre et un chiffre.</p>
      {error && <p style={{ color: '#ef4444', marginBottom: 14 }}>{error}</p>}
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input className="input" type="password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)} />
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
      </form>
      <Link href="/auth/login" style={{ display: 'inline-block', marginTop: 20, color: 'var(--primary)' }}>Retour à la connexion</Link>
    </div>
  );
}
