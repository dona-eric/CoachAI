import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '72px 24px' }}>
      <Link href="/" style={{ color: 'var(--primary)' }}>Retour à KINETIC</Link>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '28px 0 16px' }}>Politique de confidentialité</h1>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        KINETIC utilise les informations nécessaires à la création de votre compte, à la personnalisation de vos plans et au suivi de vos séances. Les données restent associées à votre compte et ne sont pas vendues.
      </p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '32px 0 10px' }}>Données d’entraînement</h2>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        Vos objectifs, votre niveau, votre équipement, vos séances et vos mesures sont utilisés pour adapter votre expérience. Vous pourrez demander la modification ou la suppression de votre compte.
      </p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '32px 0 10px' }}>Données d’exercices</h2>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        Les informations de catalogue affichées proviennent de Wger. Consultez la page d’exercice pour connaître les données disponibles et leur source.
      </p>
    </main>
  );
}
