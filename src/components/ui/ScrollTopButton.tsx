'use client'

import { useEffect, useState } from 'react'

export function ScrollTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Retour en haut de page"
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        zIndex: 50,
        width: 46,
        height: 46,
        borderRadius: '50%',
        background: 'var(--color-navy)',
        border: '1px solid rgba(251,243,229,0.2)',
        color: 'var(--color-cream)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 10px 28px rgba(6,13,28,0.35)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.85)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(.16,1,.3,1), background 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-accent)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-navy)')}
    >
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <path d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
