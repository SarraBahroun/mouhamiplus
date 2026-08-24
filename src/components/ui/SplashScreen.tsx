'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'mouhamiplus_splash_seen'

export function SplashScreen() {
  const [phase, setPhase] = useState<'visible' | 'hiding' | 'hidden'>('visible')

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setPhase('hidden')
      return
    }
    sessionStorage.setItem(STORAGE_KEY, '1')

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setPhase('hidden')
      return
    }

    const hideTimer = setTimeout(() => setPhase('hiding'), 1500)
    const removeTimer = setTimeout(() => setPhase('hidden'), 2050)
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, var(--color-navy) 0%, var(--color-navy-deep) 100%)',
      }}
    >
      <div className="flex items-center gap-3 animate-hero-logo">
        <div
          style={{
            width: 60,
            height: 60,
            background: 'var(--color-cream)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 6px 20px rgba(6, 13, 28, 0.35)',
          }}
        >
          <svg width={33} height={33} viewBox="0 0 20 20" fill="none">
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
            animationDelay: '0.25s',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--color-cream)',
            fontSize: 34,
          }}
        >
          Mouhami<span style={{ color: 'var(--color-sky)' }}>+</span>
        </span>
      </div>
    </div>
  )
}
