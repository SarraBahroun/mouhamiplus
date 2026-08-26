'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/providers/LangProvider'

const STORAGE_KEY = 'mouhamiplus_splash_seen'

export function SplashScreen() {
  const { tr } = useLang()
  const [phase, setPhase] = useState<'visible' | 'hiding' | 'hidden'>('visible')

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture ponctuelle de sessionStorage au montage, pas une synchro externe continue
      setPhase('hidden')
      return
    }
    sessionStorage.setItem(STORAGE_KEY, '1')

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setPhase('hidden')
      return
    }

    const hideTimer = setTimeout(() => setPhase('hiding'), 3100)
    const removeTimer = setTimeout(() => setPhase('hidden'), 4000)
    return () => {
      clearTimeout(hideTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (phase === 'hidden') return null

  return (
    <div
      className={phase === 'hiding' ? 'animate-splash-out' : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, var(--color-navy) 0%, var(--color-navy-deep) 100%)',
      }}
    >
      <div className="aurora-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen' }} />
      <div className="grain-overlay" style={{ position: 'absolute', inset: -20, opacity: 0.05, pointerEvents: 'none', mixBlendMode: 'overlay' }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <div className="flex items-center gap-4 animate-hero-logo" style={{ animationDuration: '1.3s' }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: 'var(--color-cream)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 10px 32px rgba(6, 13, 28, 0.4)',
            }}
          >
            <svg width={35} height={35} viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2L3 7v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V7L10 2z"
                fill="var(--color-navy)"
                opacity="0.95"
              />
              <rect x="8" y="4" width="4" height="3" rx="0.5" fill="var(--color-navy)" opacity="0.6" />
            </svg>
          </div>
          <span
            className="animate-fade-up"
            style={{
              animationDelay: '0.5s',
              animationDuration: '1.1s',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--color-cream)',
              fontSize: 40,
            }}
          >
            Mouhami<span style={{ color: 'var(--color-sky)' }}>+</span>
          </span>
        </div>

        <div
          className="animate-splash-line"
          style={{
            height: 1,
            width: 220,
            background: 'linear-gradient(90deg, transparent, var(--color-sky) 50%, transparent)',
            animationDelay: '1.1s',
          }}
        />

        <p
          className="animate-fade-up"
          style={{
            animationDelay: '1.4s',
            animationDuration: '1s',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 18,
            letterSpacing: '-0.005em',
            color: 'var(--color-sky-soft)',
            margin: 0,
            maxWidth: 360,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          {tr.mk_splash_quote}
        </p>
      </div>
    </div>
  )
}
