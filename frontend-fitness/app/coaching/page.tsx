import Link from 'next/link';
import { Bot, MessageSquare, Zap, ChevronRight } from 'lucide-react';

const quickQuestions = [
  'Comment progresser en pompes ?',
  'Que manger avant l\'entraînement ?',
  'Mes muscles sont douloureux, je peux m\'entraîner ?',
  'Comment créer un plan de perte de poids ?',
  'Combien de protéines par jour pour moi ?',
  'Comment éviter le surentraînement ?',
];

const sampleConvo = [
  {
    role: 'assistant',
    content: 'Bonjour Éric ! 👋 Je suis votre coach IA. J\'ai analysé votre profil : 7 jours de streak, plan Home Warrior actif, objectif perte de poids. Comment puis-je vous aider aujourd\'hui ?'
  },
  {
    role: 'user',
    content: 'J\'ai du mal à faire plus de 10 pompes. Comment progresser ?'
  },
  {
    role: 'assistant',
    content: 'Excellente question ! Pour progresser en pompes, voici ma méthode : 1) **Grease the groove** — faites 5 séries de 5 pompes parfaites réparties dans la journée, tous les jours. 2) **Variantes** — essayez les pompes sur les genoux pour augmenter le volume. 3) **Tempo** — descendez en 3 secondes, montez en 1 seconde. Le contrôle = la force. En 3 semaines, vous devriez dépasser 15 reps !'
  }
];

export default function CoachingPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🤖 Coaching IA</h1>
        <p className="page-subtitle">Votre coach personnel disponible 24h/24 — posez n&apos;importe quelle question.</p>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          {/* Chat interface */}
          <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 600 }}>
            {/* Chat header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--bg-elevated)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #065f46, #10b981)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={20} color="#000" />
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>Coach IA</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--primary)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
                  En ligne · Répond en quelques secondes
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sampleConvo.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 10,
                }}>
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #065f46, #10b981)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Bot size={16} color="#000" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-elevated)',
                    color: msg.role === 'user' ? '#000' : 'var(--text-primary)',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #065f46, #10b981)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={16} color="#000" />
                </div>
                <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: '16px 16px 16px 4px', border: '1px solid var(--border)', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)',
                      animation: `bounce 1.2s ease ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Input area */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  className="input"
                  placeholder="Posez votre question au coach..."
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" style={{ flexShrink: 0 }}>
                  <Zap size={16} /> Envoyer
                </button>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                🔒 L&apos;IA Groq sera intégrée prochainement · Pour l&apos;instant : interface de démonstration
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Quick questions */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={15} color="var(--primary)" /> Questions rapides
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {quickQuestions.map(q => (
                  <button key={q} style={{
                    padding: '10px 12px', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)', borderRadius: 8,
                    cursor: 'pointer', textAlign: 'left', fontSize: '0.8rem',
                    color: 'var(--text-secondary)', transition: 'all 0.15s',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6,
                  }}>
                    <span>{q}</span>
                    <ChevronRight size={12} style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>📋 Contexte partagé</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {[
                  ['Profil', 'Intermédiaire, 27 ans, 75kg'],
                  ['Objectif', '🔥 Perte de poids'],
                  ['Plan actif', 'Home Warrior (sem. 3)'],
                  ['Streak', '🔥 7 jours'],
                  ['Dernière séance', 'Hier · 45 min · 280 kcal'],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 600 }}>{l}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.4 }}>
                Le coach IA utilise ces informations pour des réponses personnalisées.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
