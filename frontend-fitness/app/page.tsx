'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Target, BookOpen, TrendingUp, Apple, Heart, ArrowRight, CheckCircle, ChevronDown } from 'lucide-react';

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55, ease: 'easeOut' as const } }),
};

const features = [
  { icon: Target,    color: '#10b981', title: 'Plans Personnalisés',    desc: 'IA qui génère votre programme selon votre niveau, objectif et équipement — même sans rien.' },
  { icon: BookOpen,  color: '#3b82f6', title: 'Bibliothèque d\'exercices', desc: '100+ exercices avec étapes, erreurs à éviter et variantes selon votre niveau.' },
  { icon: TrendingUp,color: '#8b5cf6', title: 'Suivi des Performances',  desc: 'Records, courbes de progression, calories — visualisez chaque progrès.' },
  { icon: Apple,     color: '#f59e0b', title: 'Nutrition Adaptée',       desc: 'Aliments africains inclus. Calcul des besoins, journal alimentaire, macros.' },
  { icon: Heart,     color: '#ef4444', title: 'Récupération',            desc: 'Détectez le surentraînement. Étirements, sommeil, score de récupération.' },
  { icon: Zap,       color: '#10b981', title: 'Zéro Équipement',         desc: 'Entraînez-vous comme en salle depuis chez vous. Chaise, mur, bouteilles.' },
];

const testimonials = [
  { name: 'Aminata K.',    role: 'Dakar, Sénégal',   text: 'J\'ai perdu 8kg en 3 mois. Les plans bodyweight sont parfaits pour s\'entraîner à domicile !',   avatar: 'A', stars: 5 },
  { name: 'Jean-Paul M.', role: 'Abidjan, C.I.',     text: 'Le suivi de performances m\'a aidé à battre mes records. Mes pompes ont doublé en 6 semaines.',  avatar: 'J', stars: 5 },
  { name: 'Fatouma D.',   role: 'Lomé, Togo',        text: 'La section nutrition avec nos aliments locaux est révolutionnaire. Enfin quelque chose pour nous !', avatar: 'F', stars: 5 },
];

const stats = [
  { value: '2 000+', label: 'Utilisateurs actifs' },
  { value: '100+',   label: 'Exercices' },
  { value: '4',      label: 'Programmes' },
  { value: '98%',    label: 'Satisfaction' },
];

const pricing = [
  {
    name: 'Gratuit', price: '0', period: '/mois',
    features: ['3 plans d\'entraînement', 'Bibliothèque de base (30 ex.)', 'Suivi basique', 'Journal alimentaire'],
    cta: 'Commencer gratuitement', highlighted: false,
  },
  {
    name: 'Pro', price: '4 900', period: 'FCFA/mois',
    features: ['Plans illimités', 'Bibliothèque complète (100+ ex.)', 'Analyses avancées', 'Conseils nutrition IA', 'Coach IA 24h/24'],
    cta: 'Passer au Pro', highlighted: true,
  },
  {
    name: 'Coach', price: '14 900', period: 'FCFA/mois',
    features: ['Tout Pro inclus', 'Coaching humain 1-to-1', 'Ajustements dynamiques', 'Suivi vidéo de forme', 'Consultation mensuelle'],
    cta: 'Contacter un coach', highlighted: false,
  },
];

export default function LandingPage() {
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
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #065f46, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 10px rgba(16,185,129,0.35)',
          }}>
            <Zap size={15} color="#000" fill="#000" />
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.03em' }}>KINETIC</span>
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
              <Zap size={12} /> Plateforme Fitness IA · Nouvelle Génération
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
            Plans d&apos;entraînement IA, bibliothèque d&apos;exercices, suivi des performances et nutrition 
            adaptée à votre réalité. Avec ou sans équipement.
          </motion.p>

          <motion.div
            custom={3} variants={fadeUp} initial="hidden" animate="visible"
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Commencer gratuitement <ArrowRight size={18} />
            </Link>
            <Link href="/auth/login" className="btn btn-ghost btn-lg">
              Se connecter
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            custom={4} variants={fadeUp} initial="hidden" animate="visible"
            style={{ marginTop: 56, display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {stats.map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>{value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
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
            Une plateforme complète pensée pour l&apos;Afrique, adaptée à chaque réalité.
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

      {/* ── TESTIMONIALS ── */}
      <section style={{
        padding: '70px 40px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 900, marginBottom: 44, letterSpacing: '-0.025em' }}
          >
            Ce qu&apos;ils en disent
          </motion.h2>
          <div className="grid-3" style={{ gap: 18 }}>
            {testimonials.map(({ name, role, text, avatar, stars }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card"
                style={{ padding: 24 }}
              >
                {/* Stars */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                  {Array.from({ length: stars }).map((_, j) => (
                    <span key={j} style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>★</span>
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 18, fontStyle: 'italic' }}>
                  &ldquo;{text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #065f46, #10b981)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, color: '#000', fontSize: '0.9rem',
                  }}>{avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.87rem' }}>{name}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: '90px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 52 }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 10 }}>
            Tarifs simples & transparents
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Commencez gratuitement, évoluez à votre rythme.</p>
        </motion.div>
        <div className="grid-3" style={{ gap: 18, alignItems: 'stretch' }}>
          {pricing.map(({ name, price, period, features: feats, cta, highlighted }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="card"
              style={{
                padding: 28, position: 'relative',
                border: highlighted ? '1px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: highlighted ? '0 0 40px rgba(16,185,129,0.12)' : undefined,
              }}
            >
              {highlighted && (
                <div className="badge badge-green" style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                  ⚡ Populaire
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>{name}</div>
                <div>
                  <span style={{ fontSize: '2rem', fontWeight: 900 }}>{price}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 5 }}>{period}</span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {feats.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle size={13} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className={`btn ${highlighted ? 'btn-primary' : 'btn-ghost'}`} style={{ width: '100%' }}>
                {cta}
              </Link>
            </motion.div>
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
            Prêt à transformer votre corps ?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: '1.05rem' }}>
            Rejoignez 2 000+ personnes qui s&apos;entraînent avec KINETIC chaque jour.
          </p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Démarrer maintenant — c&apos;est gratuit <ArrowRight size={18} />
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
          <Zap size={13} color="var(--primary)" />
          <span style={{ fontWeight: 900, fontSize: '0.9rem', letterSpacing: '-0.02em' }}>KINETIC</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>© 2026 — Tous droits réservés</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['À propos', 'Confidentialité', 'Conditions', 'Contact'].map(l => (
            <span key={l} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
