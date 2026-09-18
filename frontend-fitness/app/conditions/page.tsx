import Link from 'next/link';

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '72px 24px' }}>
      <Link href="/" style={{ color: 'var(--primary)' }}>Retour à KINETIC</Link>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '28px 0 16px' }}>Conditions d’utilisation</h1>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        KINETIC fournit des outils d’organisation et de suivi fitness. Les programmes proposés ne remplacent pas l’avis d’un professionnel de santé.
      </p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '32px 0 10px' }}>Utilisation responsable</h2>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        Adaptez chaque exercice à votre condition, arrêtez-vous en cas de douleur et demandez un avis médical lorsque cela est nécessaire. Vous êtes responsable des informations saisies dans votre profil.
      </p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '32px 0 10px' }}>Évolution du service</h2>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        Les fonctionnalités peuvent évoluer pendant la phase de lancement. Toute limitation ou offre payante sera présentée avant son activation.
      </p>
    </main>
  );
}
