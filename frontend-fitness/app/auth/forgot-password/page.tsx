'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="card" style={{ maxWidth: 440, margin: '12vh auto', padding: 32 }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Mot de passe oublié ?</h1>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
        Entrez votre email. Si un compte existe, vous recevrez un lien valable une heure.
      </p>
      {sent ? (
        <p style={{ color: 'var(--primary)', marginBottom: 20 }}>Vérifiez votre boîte mail pour continuer.</p>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input className="input" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="vous@example.com" />
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Envoi...' : 'Recevoir le lien'}</button>
        </form>
      )}
      <Link href="/auth/login" style={{ display: 'inline-block', marginTop: 20, color: 'var(--primary)' }}>Retour à la connexion</Link>
    </div>
  );
}
