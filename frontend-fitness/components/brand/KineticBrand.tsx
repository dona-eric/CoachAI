import { Zap } from 'lucide-react';

export default function KineticBrand({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { mark: 30, icon: 14, text: '1rem' },
    md: { mark: 36, icon: 17, text: '1.1rem' },
    lg: { mark: 44, icon: 21, text: '1.45rem' },
  };
  const current = sizes[size];

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        width: current.mark,
        height: current.mark,
        borderRadius: size === 'lg' ? 12 : 10,
        background: 'linear-gradient(135deg, #065f46, #10b981)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 16px rgba(16,185,129,0.35)',
      }}>
        <Zap size={current.icon} color="#000" fill="#000" strokeWidth={2.6} />
      </span>
      <span style={{
        fontFamily: 'var(--font-inter), Inter, sans-serif',
        fontWeight: 900,
        fontSize: current.text,
        letterSpacing: '0.08em',
        lineHeight: 1,
      }}>
        KINETIC
      </span>
    </span>
  );
}
