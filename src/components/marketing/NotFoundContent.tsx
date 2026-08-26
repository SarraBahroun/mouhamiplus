'use client'

import Link from 'next/link'
import { useLang } from '@/providers/LangProvider'

// Séparé de src/app/not-found.tsx (server component) car ce dernier exporte `metadata`,
// ce qu'un composant 'use client' ne peut pas faire — le texte traduit vit ici.
export function NotFoundContent() {
  const { tr, rtl } = useLang()

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 18,
        padding: '24px',
        background: 'linear-gradient(160deg, var(--color-navy) 0%, var(--color-navy-deep) 100%)',
      }}
    >
      <div
        className="animate-glow-float"
        style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(111,182,232,0.3) 0%, transparent 70%)',
          filter: 'blur(10px)',
          pointerEvents: 'none',
        }}
      />

      <span
        className="animate-hero-logo"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(72px, 16vw, 140px)',
          color: 'var(--color-cream)',
          lineHeight: 1,
          position: 'relative',
          zIndex: 1,
        }}
      >
        404
      </span>

      <h1
        className="animate-fade-up"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 'clamp(20px, 3vw, 26px)',
          color: 'var(--color-cream)',
          margin: 0,
          animationDelay: '0.2s',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {tr.notfound_title}
      </h1>

      <p
        className="animate-fade-up"
        style={{
          fontSize: 14.5,
          color: 'var(--color-sky-soft)',
          maxWidth: 420,
          margin: 0,
          lineHeight: 1.6,
          animationDelay: '0.35s',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {tr.notfound_body}
      </p>

      <Link
        href="/"
        className="animate-fade-up"
        style={{
          marginTop: 8,
          background: 'var(--color-cream)',
          color: 'var(--color-navy)',
          fontSize: 15,
          fontWeight: 600,
          padding: '13px 28px',
          borderRadius: 6,
          textDecoration: 'none',
          display: 'inline-block',
          animationDelay: '0.5s',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {tr.shell_home_aria}
      </Link>
    </div>
  )
}
