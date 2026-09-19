'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Target, BookOpen, TrendingUp, Apple, Heart, ArrowRight, ChevronDown } from 'lucide-react';
import KineticBrand from '@/components/brand/KineticBrand';

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55, ease: 'easeOut' as const } }),
};

const features = [
  { icon: Target,    color: '#10b981', title: 'Plans personnalisés',    desc: 'Un programme construit selon votre objectif, votre niveau et l’équipement disponible.' },
  { icon: BookOpen,  color: '#3b82f6', title: 'Exercices documentés', desc: 'Une bibliothèque alimentée par Wger avec muscles, équipements, images et vidéos disponibles.' },
  { icon: TrendingUp,color: '#8b5cf6', title: '  Suivi des performances',  desc: 'Records, courbes de progression, calories — visualisez chaque progrès.' },
  { icon: Apple,     color: '#f59e0b', title: 'Nutrition et hydratation', desc: 'Recherchez des aliments réels et suivez vos repas et votre hydratation.' },
  { icon: Heart,     color: '#ef4444', title: 'Récupération',            desc: 'Gardez une place pour le repos et construisez une progression durable.' },
  { icon: Zap,       color: '#10b981', title: 'Avec ou sans équipement', desc: 'Votre programme s’adapte à ce que vous avez réellement à la maison ou en salle.' },
];

export default function LandingPage() {
  const [featuredExercise, setFeaturedExercise] = useState<{
    name: string;
    muscles: string[];
    equipmentNames: string[];
    imageUrl?: string;
    videoUrls: string[];
  } | null>(null);
  const [featuredStatus, setFeaturedStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const featuredSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = featuredSectionRef.current;
    if (!section) return;

    const controller = new AbortController();
    let timeout: number | undefined;
    let loaded = false;
    const loadFeatured = () => {
      if (loaded) return;
      loaded = true;
      timeout = window.setTimeout(() => controller.abort(), 5000);
      fetch('/api/exercises/featured', { signal: controller.signal })
        .then(response => response.ok ? response.json() : null)
        .then(data => {
          setFeaturedExercise(data?.exercise ?? null);
          setFeaturedStatus(data?.exercise ? 'ready' : 'unavailable');
        })
        .catch(() => {
          setFeaturedExercise(null);
          setFeaturedStatus('unavailable');
        })
        .finally(() => {
          if (timeout) window.clearTimeout(timeout);
        });
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        loadFeatured();
        observer.disconnect();
      }
    }, { rootMargin: '500px' });
    observer.observe(section);

    return () => {
      observer.disconnect();
      if (timeout) window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowX: 'hidden' }}>

      {/* ── TOP NAV ── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          padding: '14px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(8,9,13,0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <KineticBrand size="sm" />
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/auth/login"    className="btn btn-ghost btn-sm">Se connecter</Link>
          <Link href="/auth/register" className="btn btn-primary btn-sm">Commencer →</Link>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 24px',
        background: 'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(16,185,129,0.2) 0%, transparent 70%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
          />
        </div>

        <div style={{ maxWidth: 820, position: 'relative' }}>
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <span className="badge badge-green" style={{ marginBottom: 28, display: 'inline-flex', fontSize: '0.8rem', padding: '6px 16px' }}>
              <Zap size={12} />                             KINETIC METHOD · The science of gymnastic strength
            </span>
          </motion.div>

          <motion.h1
            custom={1} variants={fadeUp} initial="hidden" animate="visible"
            style={{ fontSize: 'clamp(2.6rem, 8vw, 5.5rem)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-0.035em', marginBottom: 26 }}
          >
            Entraînez-vous{' '}
            <span className="text-gradient">comme un athlète</span>
            <br />même sans salle.
          </motion.h1>

          <motion.p
            custom={2} variants={fadeUp} initial="hidden" animate="visible"
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.75 }}
          >
            Master your movement. Un programme adapté à votre objectif, votre niveau et votre équipement, avec des exercices documentés et un suivi concret de vos progrès.
          </motion.p>

          <motion.div
            custom={3} variants={fadeUp} initial="hidden" animate="visible"
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Créer mon plan gratuitement <ArrowRight size={18} />
            </Link>
            <Link href="/auth/login" className="btn btn-ghost btn-lg">
              Se connecter
            </Link>
          </motion.div>

        </div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-muted)' }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </section>

      <section ref={featuredSectionRef} style={{ padding: '80px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="featured-demo-grid" style={{ maxWidth: 1050, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: 40, alignItems: 'center' }}>
          <div>
            <span className="badge badge-green" style={{ marginBottom: 16, display: 'inline-flex' }}>Démonstration issue de Wger</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.7rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 14 }}>
              Voyez exactement ce que vous allez travailler.
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 22 }}>
              Chaque exercice est relié à ses muscles, son équipement et ses instructions lorsque ces informations sont disponibles.
            </p>
            {featuredExercise ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{featuredExercise.name}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {featuredExercise.muscles.slice(0, 4).map(muscle => <span key={muscle} className="badge badge-blue">{muscle}</span>)}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Équipement : {featuredExercise.equipmentNames.join(', ') || 'Poids du corps'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {featuredExercise.videoUrls.length > 0 ? 'Vidéo disponible' : ''}
                </div>
                <Link href="/auth/register" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                  Créer mon programme <ArrowRight size={16} />
                </Link>
              </div>
            ) : featuredStatus === 'loading' ? (
              <div style={{ color: 'var(--text-muted)' }}>Chargement d’un exercice réel...</div>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>La démonstration est momentanément indisponible. Découvrez la bibliothèque complète.</div>
            )}
          </div>
          <div className="card" style={{ padding: 12, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {featuredExercise?.videoUrls[0] ? (
              <video controls playsInline preload="metadata" poster={featuredExercise.imageUrl} style={{ width: '100%', maxHeight: 360, borderRadius: 10, background: '#000' }}>
                <source src={featuredExercise.videoUrls[0]} />
              </video>
            ) : featuredExercise?.imageUrl ? (
              <img src={featuredExercise.imageUrl} alt={featuredExercise.name} style={{ width: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 10 }} />
            ) : featuredStatus === 'loading' ? (
              <span style={{ color: 'var(--text-muted)' }}>Chargement de la démonstration...</span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Illustration indisponible</span>
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '90px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 12 }}>
            Tout ce dont vous avez besoin
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>
            Les outils essentiels pour progresser avec des informations claires et un programme réaliste.
          </p>
        </motion.div>

        <div className="grid-3" style={{ gap: 18 }}>
          {features.map(({ icon: Icon, color, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="card card-glow"
              style={{ padding: 26, cursor: 'default' }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 12, marginBottom: 16,
                background: `${color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${color}25`,
              }}>
                <Icon size={21} color={color} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: 8 }}>{title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.65 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{
        padding: '80px 40px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1050, margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 900, marginBottom: 44, letterSpacing: '-0.025em' }}
          >
            Votre premier plan en trois étapes
          </motion.h2>
          <div className="grid-3" style={{ gap: 18 }}>
            {[
              { number: '01', title: 'Définissez votre objectif', text: 'Perte de poids, prise de masse, endurance ou santé générale : commencez par ce qui compte pour vous.' },
              { number: '02', title: 'Indiquez votre réalité', text: 'Votre niveau, votre équipement et le temps que vous pouvez consacrer à vos séances.' },
              { number: '03', title: 'Recevez votre programme', text: 'KINETIC sélectionne des exercices Wger adaptés et organise votre semaine d’entraînement.' },
            ].map(({ number, title, text }, i) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card"
                style={{ padding: 24 }}
              >
                <div style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.12em', marginBottom: 18 }}>{number}</div>
                <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 10 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DATA TRANSPARENCY ── */}
      <section style={{ padding: '80px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 52 }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 10 }}>
            Des données claires pour mieux vous entraîner
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 620, margin: '0 auto', lineHeight: 1.7 }}>
            Les exercices, muscles, équipements, images et vidéos disponibles sont alimentés par Wger. Vos plans, séances, records et données personnelles restent dans votre espace KINETIC.
          </p>
        </motion.div>
        <div className="card" style={{ maxWidth: 760, margin: '0 auto', padding: 28, display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center' }}>
          {['Catalogue Wger', 'Muscles et équipements', 'Suivi des séances', 'Nutrition et hydratation'].map(item => (
            <span key={item} className="badge badge-green" style={{ padding: '8px 14px' }}>{item}</span>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        padding: '90px 40px', textAlign: 'center',
        background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(16,185,129,0.1) 0%, transparent 70%)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 16 }}>
            Prêt à commencer ?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: '1.05rem' }}>
            Créez votre profil et commencez avec un programme adapté à votre réalité.
          </p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Créer mon plan gratuitement <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '20px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* <Zap size={13} color="var(--primary)" /> */}
          <KineticBrand size="sm" />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>© 2026 ~ fait par DTech-Africa</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="/confidentialite" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Confidentialité</Link>
          <Link href="/conditions" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Conditions</Link>
        </div>
      </footer>
      <style>{`
        @media (max-width: 760px) {
          .featured-demo-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  );
}
