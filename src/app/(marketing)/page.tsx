import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Reveal } from '@/components/ui/Reveal'
import { ScrollTopButton } from '@/components/ui/ScrollTopButton'
import { SmoothAnchorLinks } from '@/components/ui/SmoothAnchorLinks'
import { Eyebrow, SectionHeader } from '@/components/marketing/SectionHeader'
import { ContactForm } from '@/components/marketing/ContactForm'
import { TYPE, SPACE } from '@/components/marketing/theme'
import { createClient } from '@/lib/supabase/server'

function HeroLogo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        style={{
          width: size,
          height: size,
          background: 'var(--color-cream)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 6px 20px rgba(6, 13, 28, 0.35)',
        }}
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 20 20" fill="none">
          <path
            d="M10 2L3 7v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V7L10 2z"
            fill="var(--color-navy)"
            opacity="0.95"
          />
          <rect x="8" y="4" width="4" height="3" rx="0.5" fill="var(--color-navy)" opacity="0.6" />
        </svg>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'var(--color-cream)',
          fontSize: size * 0.55,
        }}
      >
        Mouhami<span style={{ color: 'var(--color-sky)' }}>+</span>
      </span>
    </div>
  )
}

/** Filigrane "balance de la justice" — dessiné à la main en formes simples, pas d'illustration générative. */
function JusticeMark() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" fill="none">
      <line x1="100" y1="14" x2="100" y2="168" stroke="var(--color-cream)" strokeWidth="1.5" />
      <circle cx="100" cy="14" r="5" fill="var(--color-cream)" />
      <line x1="38" y1="42" x2="162" y2="42" stroke="var(--color-cream)" strokeWidth="1.5" />
      <line x1="38" y1="42" x2="22" y2="88" stroke="var(--color-cream)" strokeWidth="1.2" />
      <line x1="38" y1="42" x2="54" y2="88" stroke="var(--color-cream)" strokeWidth="1.2" />
      <path d="M22 88a16 11 0 0032 0" stroke="var(--color-cream)" strokeWidth="1.2" fill="none" />
      <line x1="162" y1="42" x2="146" y2="88" stroke="var(--color-cream)" strokeWidth="1.2" />
      <line x1="162" y1="42" x2="178" y2="88" stroke="var(--color-cream)" strokeWidth="1.2" />
      <path d="M146 88a16 11 0 0032 0" stroke="var(--color-cream)" strokeWidth="1.2" fill="none" />
      <path d="M76 168h48l-9 14H85z" fill="var(--color-cream)" />
      <line x1="66" y1="168" x2="134" y2="168" stroke="var(--color-cream)" strokeWidth="1.5" />
    </svg>
  )
}

const STATS = [
  { value: '500+', label: 'Cabinets & avocats' },
  { value: '18 000+', label: 'Dossiers suivis' },
  { value: '24 / 7', label: 'Accès sécurisé' },
]

const ARTICLES = [
  {
    n: 'I',
    title: 'Vos dossiers, centralisés',
    body: 'Chaque affaire, ses pièces, son historique et son calendrier réunis au même endroit — pour le cabinet comme pour le client.',
  },
  {
    n: 'II',
    title: 'Vos échanges, tracés',
    body: 'Messages, documents et rendez-vous restent horodatés et consultables, sans jamais se perdre dans une boîte mail.',
  },
  {
    n: 'III',
    title: 'Vos données, protégées',
    body: 'Authentification à deux facteurs, permissions par rôle et chiffrement, activés par défaut sur chaque compte.',
  },
  {
    n: 'IV',
    title: 'Votre temps, respecté',
    body: 'Facturation, rappels d’audience et rapports générés automatiquement, pour vous consacrer au droit.',
  },
]

const REASONS = [
  {
    problem: 'Dossiers dispersés entre e-mails, WhatsApp et papier',
    solution: 'Chaque dossier centralisé, avec pièces, historique et calendrier au même endroit',
  },
  {
    problem: 'Heures perdues chaque semaine sur des tâches administratives',
    solution: 'Facturation, rappels d’audience et rapports générés automatiquement',
  },
  {
    problem: 'Aucune visibilité pour le client sur l’avancement de son dossier',
    solution: 'Un espace client dédié, mis à jour en temps réel',
  },
  {
    problem: 'Sécurité des données laissée au hasard',
    solution: 'Authentification à deux facteurs et chiffrement activés par défaut',
  },
]

const PERFORMANCE = [
  { value: '-70%', label: 'Temps passé sur l’administratif' },
  { value: '2x', label: 'Dossiers traités par collaborateur' },
  { value: '<24h', label: 'Délai moyen de réponse client' },
]

const PLANS = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: '89',
    tagline: 'Pour l’avocat indépendant',
    features: ['Dossiers & clients illimités', 'Espace client inclus', 'Agenda & rappels d’audience', '1 utilisateur'],
    highlight: false,
  },
  {
    id: 'cabinet',
    name: 'Cabinet',
    price: '249',
    tagline: 'Le plus populaire',
    features: ['Tout Essentiel, plus :', 'Jusqu’à 10 collaborateurs', 'Facturation & paiements', 'Permissions par rôle'],
    highlight: true,
  },
  {
    id: 'entreprise',
    name: 'Entreprise',
    price: 'Sur devis',
    tagline: 'Cabinets multi-bureaux',
    features: ['Utilisateurs illimités', 'Accès API & intégrations', 'Audit & conformité avancés', 'Support dédié'],
    highlight: false,
  },
]

export default async function MarketingHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
    if (profile) redirect('/dashboard')
    const { data: client } = await supabase.from('clients').select('id').eq('auth_user_id', user.id).maybeSingle()
    if (client) redirect('/espace-client/dashboard')
  }

  return (
    <div style={{ background: '#FFFCF6' }}>
      {/* Nav + Hero — fond bleu nuit */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, var(--color-navy) 0%, var(--color-navy-deep) 100%)',
        }}
      >
        {/* Glows bleu ciel animés */}
        <div
          className="animate-glow-float"
          style={{
            position: 'absolute',
            top: '-15%',
            left: '-10%',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(111,182,232,0.35) 0%, transparent 70%)',
            filter: 'blur(10px)',
            pointerEvents: 'none',
          }}
        />
        <div
          className="animate-glow-float"
          style={{
            position: 'absolute',
            bottom: '-20%',
            right: '-8%',
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(169,214,242,0.25) 0%, transparent 70%)',
            filter: 'blur(10px)',
            pointerEvents: 'none',
            animationDelay: '2s',
          }}
        />

        {/* Voile mouvant "aurora" — donne l'effet vidéo/mouvement continu */}
        <div
          className="aurora-bg"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen' }}
        />
        {/* Grain filmique subtil */}
        <div
          className="grain-overlay"
          style={{ position: 'absolute', inset: -20, opacity: 0.05, pointerEvents: 'none', mixBlendMode: 'overlay' }}
        />

        {/* Filigrane balance de la justice — signature visuelle */}
        <div
          className="animate-watermark-spin"
          style={{
            position: 'absolute',
            top: '50%',
            right: '-14%',
            width: 720,
            height: 720,
            opacity: 0.05,
            pointerEvents: 'none',
          }}
        >
          <JusticeMark />
        </div>

        <nav
          className="animate-fade-down"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 28px',
            borderBottom: '1px solid rgba(251,243,229,0.1)',
          }}
        >
          <HeroLogo size={32} />
          <div className="flex items-center gap-6">
            <a
              href="#pourquoi"
              className="hidden sm:inline"
              style={{ color: 'var(--color-sky-soft)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              Pourquoi Mouhami+
            </a>
            <a
              href="#contact"
              className="hidden sm:inline"
              style={{ color: 'var(--color-sky-soft)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              Contact
            </a>
            <a
              href="#abonnements"
              className="hidden sm:inline"
              style={{ color: 'var(--color-sky-soft)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              Abonnements
            </a>
            <Link
              href="/register"
              style={{ color: 'var(--color-cream)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              S&apos;inscrire
            </Link>
            <Link
              href="/acceder"
              style={{
                background: 'var(--color-cream)',
                color: 'var(--color-navy)',
                fontSize: 14,
                fontWeight: 600,
                padding: '9px 18px',
                borderRadius: 6,
                textDecoration: 'none',
              }}
            >
              Entrer
            </Link>
          </div>
        </nav>

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '88px 24px 0',
            gap: 20,
          }}
        >
          <div className="animate-hero-logo">
            <HeroLogo size={60} />
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <Eyebrow>Mouhami+ · plateforme juridique</Eyebrow>
          </div>

          <h1
            className="animate-fade-up"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: TYPE.hero,
              color: 'var(--color-cream)',
              margin: 0,
              maxWidth: 780,
              lineHeight: 1.1,
              animationDelay: '0.4s',
              textWrap: 'balance' as React.CSSProperties['textWrap'],
            }}
          >
            La plateforme juridique de{' '}
            <em style={{ color: 'var(--color-sky)', fontStyle: 'italic' }}>confiance</em>
          </h1>

          <p
            className="animate-fade-up"
            style={{
              fontSize: TYPE.heroLead,
              color: 'var(--color-sky-soft)',
              maxWidth: 540,
              margin: 0,
              lineHeight: 1.65,
              animationDelay: '0.6s',
            }}
          >
            Cabinets, avocats indépendants et clients : gérez vos dossiers, vos échanges et vos
            factures au même endroit, en toute sécurité.
          </p>

          <div
            className="animate-fade-up flex flex-col sm:flex-row items-center gap-3"
            style={{ marginTop: 6, animationDelay: '0.8s' }}
          >
            <Link
              href="/register"
              className="animate-ring-pulse"
              style={{
                background: 'var(--color-cream)',
                color: 'var(--color-navy)',
                fontSize: 15,
                fontWeight: 600,
                padding: '13px 26px',
                borderRadius: 6,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              S&apos;inscrire
            </Link>
            <Link
              href="/acceder"
              style={{
                background: 'transparent',
                border: '1.5px solid rgba(251,243,229,0.35)',
                color: 'var(--color-cream)',
                fontSize: 15,
                fontWeight: 600,
                padding: '13px 26px',
                borderRadius: 6,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Entrer dans mon espace
            </Link>
          </div>

          {/* Bandeau de repères chiffrés */}
          <div
            className="animate-fade-up flex items-stretch"
            style={{ marginTop: 56, animationDelay: '1s', borderTop: '1px solid rgba(251,243,229,0.14)', width: '100%', maxWidth: 620 }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  padding: '22px 12px',
                  borderLeft: i === 0 ? 'none' : '1px solid rgba(251,243,229,0.14)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: TYPE.stat,
                    fontWeight: 500,
                    color: 'var(--color-cream)',
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: TYPE.eyebrow - 0.5, color: 'var(--color-sky-soft)', marginTop: 4, letterSpacing: '0.02em' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: 8 }} />
        </div>
      </div>

      {/* Pourquoi Mouhami+ — causes concrètes et performance mesurable, fond blanc chaud */}
      <section id="pourquoi" style={{ background: '#FFFFFF', padding: '88px 24px', scrollMarginTop: 24 }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <SectionHeader
            eyebrow="Pourquoi Mouhami+"
            title="Les problèmes que vivent les cabinets, et comment on les résout"
            intro="Mouhami+ est né de constats simples, observés dans des dizaines de cabinets tunisiens."
            align="center"
            maxWidth={560}
            style={{ marginBottom: SPACE['2xl'] }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{ marginBottom: 56 }}>
            {REASONS.map((r, i) => (
              <Reveal key={r.problem} delay={i * 0.08}>
                <div
                  style={{
                    background: 'var(--color-secondary)',
                    borderRadius: 10,
                    padding: '22px 24px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: TYPE.eyebrow - 1, fontWeight: 600, color: 'var(--color-error)', letterSpacing: '0.04em', flexShrink: 0, marginTop: 2 }}>
                      AVANT
                    </span>
                    <p style={{ fontSize: TYPE.body, color: 'var(--color-muted-foreground)', margin: 0, lineHeight: 1.55 }}>
                      {r.problem}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: TYPE.eyebrow - 1, fontWeight: 600, color: 'var(--color-sky)', letterSpacing: '0.04em', flexShrink: 0, marginTop: 2 }}>
                      AVEC MOUHAMI+
                    </span>
                    <p style={{ fontSize: TYPE.bodyStrong, color: 'var(--color-ink)', margin: 0, lineHeight: 1.55, fontWeight: 500 }}>
                      {r.solution}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div
              style={{
                background: 'var(--color-navy)',
                borderRadius: 12,
                padding: '36px 28px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                gap: 24,
              }}
            >
              {PERFORMANCE.map((p) => (
                <div key={p.label} style={{ textAlign: 'center', minWidth: 140 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontVariantNumeric: 'tabular-nums',
                      fontSize: TYPE.statLarge,
                      fontWeight: 500,
                      color: 'var(--color-cream)',
                    }}
                  >
                    {p.value}
                  </div>
                  <div style={{ fontSize: TYPE.caption, color: 'var(--color-sky-soft)', marginTop: 6 }}>{p.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Notre engagement — charte en quatre articles, fond crème */}
      <section style={{ padding: '96px 24px 88px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'left' }}>
          <SectionHeader
            eyebrow="Notre engagement"
            title="Quatre articles, une seule promesse"
            style={{ marginBottom: SPACE.xl }}
          />

          <div>
            {ARTICLES.map((a, i) => (
              <Reveal key={a.n} delay={i * 0.08}>
                <div
                  style={{
                    display: 'flex',
                    gap: 24,
                    padding: '26px 0',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: 22,
                      color: 'var(--color-sky)',
                      minWidth: 34,
                      flexShrink: 0,
                    }}
                  >
                    {a.n}.
                  </span>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: TYPE.cardTitle, fontWeight: 600, margin: '0 0 6px', color: 'var(--color-ink)' }}>
                      {a.title}
                    </h3>
                    <p style={{ fontSize: TYPE.bodyStrong, color: 'var(--color-muted-foreground)', margin: 0, lineHeight: 1.65, maxWidth: 520 }}>
                      {a.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Abonnements — fond crème */}
      <section id="abonnements" style={{ padding: '40px 24px 96px', scrollMarginTop: 24 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <SectionHeader
            eyebrow="Abonnements"
            title="Des abonnements pensés pour chaque cabinet"
            intro="Changez de formule à tout moment, sans engagement."
            align="center"
            style={{ marginBottom: SPACE['2xl'] }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.id} delay={i * 0.1}>
                <div
                  style={{
                    background: '#FFFFFF',
                    border: plan.highlight ? '2px solid var(--color-navy)' : '1px solid var(--color-border)',
                    borderRadius: 10,
                    padding: '32px 26px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 18,
                    position: 'relative',
                    boxShadow: plan.highlight ? '0 16px 40px rgba(12,24,48,0.14)' : '0 1px 3px rgba(12,24,48,0.05)',
                    height: '100%',
                  }}
                >
                  {plan.highlight && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -12,
                        left: 26,
                        background: 'var(--color-navy)',
                        color: 'var(--color-cream)',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 4,
                        letterSpacing: '0.03em',
                      }}
                    >
                      {plan.tagline.toUpperCase()}
                    </span>
                  )}
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: TYPE.cardTitle, fontWeight: 600, margin: '0 0 4px', color: 'var(--color-ink)' }}>
                      {plan.name}
                    </h3>
                    {!plan.highlight && (
                      <p style={{ fontSize: TYPE.small, color: 'var(--color-muted-foreground)', margin: 0 }}>{plan.tagline}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 600, color: 'var(--color-navy)' }}>
                      {plan.price}
                    </span>
                    {plan.price !== 'Sur devis' && (
                      <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>DT / mois</span>
                    )}
                  </div>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: 0, padding: 0, listStyle: 'none', flex: 1 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--color-ink)' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                          <path d="M2.5 7l3 3 6-6" stroke="var(--color-sky)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    style={{
                      textAlign: 'center',
                      background: plan.highlight ? 'var(--color-navy)' : 'var(--color-secondary)',
                      color: plan.highlight ? 'var(--color-cream)' : 'var(--color-navy)',
                      fontSize: 14,
                      fontWeight: 600,
                      padding: '11px 16px',
                      borderRadius: 6,
                      textDecoration: 'none',
                    }}
                  >
                    Commencer
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact — fond blanc chaud, mise en page asymétrique */}
      <section id="contact" style={{ background: '#FFFFFF', padding: '96px 24px', scrollMarginTop: 24 }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-14">

            <Reveal>
              <Eyebrow>Contact</Eyebrow>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: TYPE.heading,
                  color: 'var(--color-ink)',
                  margin: '10px 0 12px',
                }}
              >
                Parlons-en
              </h2>
              <p style={{ fontSize: TYPE.intro, color: 'var(--color-muted-foreground)', margin: '0 0 32px', maxWidth: 420, lineHeight: 1.6 }}>
                Une question, une démo à organiser ? Notre équipe vous répond rapidement.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                {[
                  {
                    label: 'E-mail',
                    value: 'contact@mouhami.plus',
                    href: 'mailto:contact@mouhami.plus',
                    icon: (
                      <path d="M2 4h16v12H2V4zm0 0l8 6 8-6" stroke="var(--color-navy)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    ),
                  },
                  {
                    label: 'Téléphone',
                    value: '+216 50 521 135',
                    href: 'tel:+21650521135',
                    icon: (
                      <path
                        d="M4 3h3l2 5-2 1a10 10 0 005 5l1-2 5 2v3a1 1 0 01-1 1A15 15 0 013 4a1 1 0 011-1z"
                        stroke="var(--color-navy)"
                        strokeWidth="1.4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ),
                  },
                  {
                    label: 'Adresse',
                    value: 'iLab, Sfax',
                    href: undefined,
                    icon: (
                      <path
                        d="M10 18s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10z M10 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                        stroke="var(--color-navy)"
                        strokeWidth="1.4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ),
                  },
                  {
                    label: 'Horaires',
                    value: 'Lun – Ven, 9h – 18h',
                    href: undefined,
                    icon: (
                      <path
                        d="M10 18a8 8 0 100-16 8 8 0 000 16z M10 5v5l3.5 2"
                        stroke="var(--color-navy)"
                        strokeWidth="1.4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ),
                  },
                ].map((c) => {
                  const rowStyle: React.CSSProperties = {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    textDecoration: 'none',
                  }
                  const inner = (
                    <>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          background: 'rgba(111,182,232,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 20 20">{c.icon}</svg>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{ fontSize: 11.5, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {c.label}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>{c.value}</span>
                      </div>
                    </>
                  )
                  return c.href ? (
                    <a key={c.label} href={c.href} style={rowStyle}>
                      {inner}
                    </a>
                  ) : (
                    <div key={c.label} style={rowStyle}>
                      {inner}
                    </div>
                  )
                })}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <ContactForm />
            </Reveal>
          </div>

          <Reveal delay={0.2} style={{ marginTop: 40 }}>
            <div
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                height: 320,
              }}
            >
              <iframe
                title="Mouhami+ — iLab, Sfax"
                src="https://www.google.com/maps?q=iLab+Sfax,+Tunisie&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer — fond bleu nuit */}
      <footer
        style={{
          background: 'var(--color-navy-deep)',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <HeroLogo size={26} />
        <div className="flex items-center gap-5">
          {[
            { label: 'Conditions', href: '/conditions' },
            { label: 'Confidentialité', href: '/confidentialite' },
            { label: 'Support', href: '#contact' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{ fontSize: 12, color: 'var(--color-sky-soft)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}
            >
              {item.label}
            </a>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'rgba(169,214,242,0.5)' }}>© 2026 Mouhami+. Tous droits réservés.</span>
      </footer>

      <ScrollTopButton />
      <SmoothAnchorLinks />
    </div>
  )
}
