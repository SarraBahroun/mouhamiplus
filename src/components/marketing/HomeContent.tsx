'use client'

import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { ScrollTopButton } from '@/components/ui/ScrollTopButton'
import { SmoothAnchorLinks } from '@/components/ui/SmoothAnchorLinks'
import { Eyebrow, SectionHeader } from '@/components/marketing/SectionHeader'
import { ContactForm } from '@/components/marketing/ContactForm'
import { MobileNav } from '@/components/marketing/MobileNav'
import { LangSelector } from '@/components/ui/LangSelector'
import { TYPE, SPACE } from '@/components/marketing/theme'
import { useLang } from '@/providers/LangProvider'

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

export function HomeContent() {
  const { tr, rtl, lang, setLang } = useLang()

  const STATS = [
    { value: '2FA', label: tr.home_stat_security },
    { value: '24 / 7', label: tr.home_stat_access },
    { value: '2026', label: tr.home_stat_launch },
  ]

  const ARTICLES = [
    { n: 'I', title: tr.home_article1_title, body: tr.home_article1_body },
    { n: 'II', title: tr.home_article2_title, body: tr.home_article2_body },
    { n: 'III', title: tr.home_article3_title, body: tr.home_article3_body },
    { n: 'IV', title: tr.home_article4_title, body: tr.home_article4_body },
  ]

  const REASONS = [
    { problem: tr.home_reason1_problem, solution: tr.home_reason1_solution },
    { problem: tr.home_reason2_problem, solution: tr.home_reason2_solution },
    { problem: tr.home_reason3_problem, solution: tr.home_reason3_solution },
    { problem: tr.home_reason4_problem, solution: tr.home_reason4_solution },
  ]

  const PLANS = [
    {
      id: 'essentiel',
      name: tr.home_plan1_name,
      price: '89',
      tagline: tr.home_plan1_tagline,
      features: [tr.home_plan1_f1, tr.home_plan1_f2, tr.home_plan1_f3, tr.home_plan1_f4],
      highlight: false,
    },
    {
      id: 'cabinet',
      name: tr.home_plan2_name,
      price: '249',
      tagline: tr.home_plan2_tagline,
      features: [tr.home_plan2_f1, tr.home_plan2_f2, tr.home_plan2_f3, tr.home_plan2_f4],
      highlight: true,
    },
    {
      id: 'entreprise',
      name: tr.home_plan3_name,
      price: tr.home_price_on_quote,
      tagline: tr.home_plan3_tagline,
      features: [tr.home_plan3_f1, tr.home_plan3_f2, tr.home_plan3_f3, tr.home_plan3_f4],
      highlight: false,
    },
  ]

  const CONTACT_ITEMS = [
    {
      label: tr.common_email,
      value: 'mouhamiplus@gmail.com',
      href: 'mailto:mouhamiplus@gmail.com',
      icon: (
        <path d="M2 4h16v12H2V4zm0 0l8 6 8-6" stroke="var(--color-navy)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      label: tr.common_phone,
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
      label: tr.common_address,
      value: tr.home_contact_address_value,
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
      label: tr.home_contact_hours_label,
      value: tr.home_contact_hours_value,
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
  ]

  const FOOTER_LINKS = [
    { label: tr.shell_footer_terms, href: '/conditions' },
    { label: tr.shell_footer_privacy, href: '/confidentialite' },
    { label: tr.shell_footer_support, href: '#contact' },
  ]

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} style={{ background: '#FFFCF6' }}>
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
            // Au-dessus du contenu du hero (z-index 2) : la nav crée son propre
            // contexte d'empilement, donc le menu burger ouvert — quel que soit son
            // z-index interne — restait sous le bloc hero qui la suit dans le DOM.
            // Le hero interceptait alors les clics sur les liens du menu.
            zIndex: 10,
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
              {tr.home_nav_why}
            </a>
            <a
              href="#contact"
              className="hidden sm:inline"
              style={{ color: 'var(--color-sky-soft)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              {tr.home_nav_contact}
            </a>
            <a
              href="#abonnements"
              className="hidden sm:inline"
              style={{ color: 'var(--color-sky-soft)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              {tr.home_nav_plans}
            </a>
            {/* Sous sm, le sélecteur de langue et ces deux actions vivent dans le
                menu burger : côte à côte ils débordaient de la largeur d'un
                téléphone. */}
            <span className="hidden sm:flex">
              <LangSelector lang={lang} setLang={setLang} variant="onDark" />
            </span>
            <Link
              href="/register"
              className="hidden sm:inline"
              style={{ color: 'var(--color-cream)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              {tr.register}
            </Link>
            <Link
              href="/acceder"
              className="hidden sm:inline-block"
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
              {tr.home_nav_enter}
            </Link>
            {/* En dernier : le burger se retrouve au bout de la barre, du côté
                opposé au logo, au lieu d'être coincé avant les deux actions. Le
                côté suit la langue — à droite en français, à gauche en arabe,
                comme le reste de la page. */}
            <MobileNav />
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
            <Eyebrow>{tr.home_eyebrow}</Eyebrow>
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
            {tr.home_hero_title_pre}{' '}
            <em style={{ color: 'var(--color-sky)', fontStyle: 'italic' }}>{tr.home_hero_title_em}</em>
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
            {tr.home_hero_lead}
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
              {tr.register}
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
              {tr.home_hero_cta_enter}
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
            eyebrow={tr.home_why_eyebrow}
            title={tr.home_why_title}
            intro={tr.home_why_intro}
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
                      {tr.home_before_label}
                    </span>
                    <p style={{ fontSize: TYPE.body, color: 'var(--color-muted-foreground)', margin: 0, lineHeight: 1.55 }}>
                      {r.problem}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: TYPE.eyebrow - 1, fontWeight: 600, color: 'var(--color-sky)', letterSpacing: '0.04em', flexShrink: 0, marginTop: 2 }}>
                      {tr.home_after_label}
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
                padding: '32px 28px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
              }}
            >
              <p style={{ fontSize: TYPE.intro, color: 'var(--color-cream)', margin: 0, maxWidth: 480, lineHeight: 1.5 }}>
                {tr.home_cta_banner}
              </p>
              <Link
                href="/register"
                style={{
                  background: 'var(--color-cream)',
                  color: 'var(--color-navy)',
                  fontSize: TYPE.body,
                  fontWeight: 600,
                  padding: '11px 22px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {tr.register}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Notre engagement — charte en quatre articles, fond crème */}
      <section style={{ padding: '96px 24px 88px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'left' }}>
          <SectionHeader
            eyebrow={tr.home_commitment_eyebrow}
            title={tr.home_commitment_title}
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
            eyebrow={tr.home_plans_eyebrow}
            title={tr.home_plans_title}
            intro={tr.home_plans_intro}
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
                    {plan.price !== tr.home_price_on_quote && (
                      <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>{tr.home_price_per_month}</span>
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
                    {tr.home_plan_cta}
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
              <Eyebrow>{tr.home_contact_eyebrow}</Eyebrow>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: TYPE.heading,
                  color: 'var(--color-ink)',
                  margin: '10px 0 12px',
                }}
              >
                {tr.home_contact_title}
              </h2>
              <p style={{ fontSize: TYPE.intro, color: 'var(--color-muted-foreground)', margin: '0 0 32px', maxWidth: 420, lineHeight: 1.6 }}>
                {tr.home_contact_intro}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                {CONTACT_ITEMS.map((c) => {
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
                title={tr.home_map_title}
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
          {FOOTER_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{ fontSize: 12, color: 'var(--color-sky-soft)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}
            >
              {item.label}
            </a>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'rgba(169,214,242,0.5)' }}>{tr.home_copyright}</span>
      </footer>

      <ScrollTopButton />
      <SmoothAnchorLinks />
    </div>
  )
}
