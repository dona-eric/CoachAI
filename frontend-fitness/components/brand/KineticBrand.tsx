import logo from '@/app/assets/final_version.jpg';

export default function KineticBrand({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { width: 92 },
    md: { width: 116 },
    lg: { width: 280 },
  };
  const current = sizes[size];

  return (
    <span style={{ display: 'inline-flex', width: current.width, flexShrink: 0 }}>
      <img
        src={logo.src}
        alt="KINETIC METHOD"
        width={logo.width}
        height={logo.height}
        style={{ display: 'block', width: '100%', height: 'auto' }}
      />
    </span>
  );
}
